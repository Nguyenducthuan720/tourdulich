const express = require("express");
const { getChatCollection } = require("../config/mongodb");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /api/admin/ai/stats — thống kê tổng quan về hội thoại AI
router.get("/stats", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const col = getChatCollection();

    const [totals, deviceSplit, topDestinations, topTags, budgetAgg, dailyTrend] = await Promise.all([
      col
        .aggregate([
          {
            $group: {
              _id: null,
              sessions: { $sum: 1 },
              messages: { $sum: { $size: { $ifNull: ["$conversations", []] } } },
              loggedInSessions: {
                $sum: { $cond: [{ $ne: ["$user_id", null] }, 1, 0] },
              },
            },
          },
        ])
        .toArray(),
      col.aggregate([{ $group: { _id: "$meta_data.device", count: { $sum: 1 } } }]).toArray(),
      col
        .aggregate([
          { $unwind: { path: "$extracted_behavior.preferred_destinations", preserveNullAndEmptyArrays: false } },
          { $group: { _id: "$extracted_behavior.preferred_destinations", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 8 },
        ])
        .toArray(),
      col
        .aggregate([
          { $unwind: { path: "$extracted_behavior.inferred_tags", preserveNullAndEmptyArrays: false } },
          { $group: { _id: "$extracted_behavior.inferred_tags", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ])
        .toArray(),
      col
        .aggregate([
          {
            $group: {
              _id: null,
              avgBudget: { $avg: "$extracted_behavior.max_budget_detected" },
              avgDuration: { $avg: "$extracted_behavior.duration_days_detected" },
              withBudget: {
                $sum: { $cond: [{ $ne: ["$extracted_behavior.max_budget_detected", null] }, 1, 0] },
              },
            },
          },
        ])
        .toArray(),
      col
        .aggregate([
          {
            $match: {
              last_updated: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$last_updated" } },
              sessions: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray(),
    ]);

    const t = totals[0] || { sessions: 0, messages: 0, loggedInSessions: 0 };
    const b = budgetAgg[0] || { avgBudget: null, avgDuration: null, withBudget: 0 };

    res.json({
      success: true,
      data: {
        totalSessions: t.sessions,
        totalMessages: t.messages,
        loggedInSessions: t.loggedInSessions,
        guestSessions: t.sessions - t.loggedInSessions,
        avgMessagesPerSession: t.sessions ? Math.round((t.messages / t.sessions) * 10) / 10 : 0,
        deviceSplit: deviceSplit.map((d) => ({ device: d._id || "Unknown", count: d.count })),
        topDestinations: topDestinations.map((d) => ({ name: d._id, count: d.count })),
        topTags: topTags.map((d) => ({ name: d._id, count: d.count })),
        avgBudget: b.avgBudget ? Math.round(b.avgBudget) : 0,
        avgDuration: b.avgDuration ? Math.round(b.avgDuration * 10) / 10 : 0,
        sessionsWithBudget: b.withBudget,
        trend7Days: dailyTrend.map((d) => ({ date: d._id, sessions: d.sessions })),
      },
    });
  } catch (error) {
    console.error("AI stats error:", error);
    res.status(500).json({ success: false, message: "Lỗi lấy thống kê AI" });
  }
});

// GET /api/admin/ai/sessions — danh sách phiên chat
router.get("/sessions", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const search = (req.query.search || "").trim();

    const filter = search ? { session_id: { $regex: search, $options: "i" } } : {};
    const col = getChatCollection();

    const [items, total] = await Promise.all([
      col
        .find(filter, {
          projection: {
            session_id: 1,
            user_id: 1,
            meta_data: 1,
            extracted_behavior: 1,
            last_updated: 1,
            messageCount: { $size: { $ifNull: ["$conversations", []] } },
            lastMessage: { $arrayElemAt: ["$conversations.message", -1] },
          },
        })
        .sort({ last_updated: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      col.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    console.error("AI sessions error:", error);
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách phiên chat" });
  }
});

// GET /api/admin/ai/sessions/:sessionId — chi tiết một phiên
router.get("/sessions/:sessionId", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const doc = await getChatCollection().findOne({ session_id: req.params.sessionId });
    if (!doc) {
      return res.status(404).json({ success: false, message: "Không tìm thấy phiên chat" });
    }
    res.json({ success: true, data: doc });
  } catch (error) {
    console.error("AI session detail error:", error);
    res.status(500).json({ success: false, message: "Lỗi lấy chi tiết phiên chat" });
  }
});

// DELETE /api/admin/ai/sessions/:sessionId — xoá phiên
router.delete("/sessions/:sessionId", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const result = await getChatCollection().deleteOne({ session_id: req.params.sessionId });
    if (!result.deletedCount) {
      return res.status(404).json({ success: false, message: "Không tìm thấy phiên chat" });
    }
    res.json({ success: true, message: "Đã xoá phiên chat" });
  } catch (error) {
    console.error("AI session delete error:", error);
    res.status(500).json({ success: false, message: "Lỗi xoá phiên chat" });
  }
});

module.exports = router;
