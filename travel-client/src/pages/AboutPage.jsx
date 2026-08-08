import { Link } from 'react-router-dom'

const values = [
  { icon: '', title: 'Chất lượng', desc: 'Cam kết dịch vụ cao cấp, trải nghiệm hoàn hảo cho mỗi chuyến đi' },
  { icon: '', title: 'An toàn', desc: 'Bảo hiểm toàn diện, hỗ trợ 24/7 trong suốt hành trình' },
  { icon: '', title: 'Giá trị', desc: 'Mức giá cạnh tranh, nhiều ưu đãi đặc biệt cho khách hàng thân thiết' },
  { icon: '', title: 'Bền vững', desc: 'Du lịch có trách nhiệm, góp phần bảo vệ môi trường và văn hóa địa phương' },
]

const stats = [
  { number: '18+', label: 'Tour du lịch' },
  { number: '1000+', label: 'Khách hàng hài lòng' },
  { number: '50+', label: 'Điểm đến' },
  { number: '5★', label: 'Đánh giá trung bình' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative h-[500px] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80" 
          alt="About Hero" 
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/80"></div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 pt-32 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 inline-block rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-300 backdrop-blur-sm">
              ✦ Về chúng tôi
            </p>
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-white lg:text-7xl">
              Câu chuyện
              <span className="block text-amber-400">Tour Lượng</span>
            </h1>
            <p className="text-xl text-slate-300">
              Kết nối những chuyến đi, tạo nên những kỷ niệm đáng nhớ
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 items-center">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-amber-600">Câu chuyện</p>
            <h2 className="mb-8 text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
              Hành trình từ đam mê đến sứ mệnh
            </h2>
            <div className="space-y-5 text-lg text-slate-600 leading-relaxed">
              <p>
                Tour Lượng được thành lập từ niềm đam mê du lịch và mong muốn mang đến những trải nghiệm tốt nhất cho khách hàng Việt Nam.
              </p>
              <p>
                Chúng tôi hiểu rằng mỗi chuyến đi không chỉ là việc di chuyển từ nơi này đến nơi khác, mà là hành trình khám phá, trải nghiệm và tạo nên những kỷ niệm vô giá.
              </p>
              <p>
                Với đội ngũ chuyên nghiệp và đối tác uy tín, Tour Lượng cam kết mang đến dịch vụ đẳng cấp, từ khâu tư vấn đến khi kết thúc hành trình.
              </p>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80" 
              alt="Story" 
              className="rounded-3xl shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 rounded-2xl bg-amber-500 p-8 text-white shadow-xl">
              <p className="text-5xl font-bold">5+</p>
              <p className="text-sm font-semibold uppercase tracking-wider">Năm kinh nghiệm</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-900 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-5xl font-bold text-amber-500 mb-3">{stat.number}</p>
                <p className="text-lg text-slate-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="text-center mb-16">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-amber-600">Giá trị cốt lõi</p>
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
            Chúng tôi tin vào điều gì
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {values.map((value, idx) => (
            <div key={idx} className="rounded-3xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="mb-5 inline-block w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl">
                {value.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
              <p className="text-slate-600 leading-relaxed">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-amber-100 p-10 border border-amber-200">
              <div className="mb-5 inline-block w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center text-3xl text-white">
              
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">Sứ mệnh</h3>
              <p className="text-lg text-slate-700 leading-relaxed">
                Mang đến những trải nghiệm du lịch đẳng cấp, kết nối con người với thiên nhiên và văn hóa, tạo nên những kỷ niệm đáng nhớ cho mỗi khách hàng.
              </p>
            </div>
            <div className="rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 p-10 border border-slate-300">
              <div className="mb-5 inline-block w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-3xl text-white">
                🔭
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">Tầm nhìn</h3>
              <p className="text-lg text-slate-700 leading-relaxed">
                Trở thành nền tảng đặt tour du lịch hàng đầu Việt Nam, tiên phong trong việc ứng dụng công nghệ để mang đến dịch vụ hoàn hảo nhất.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-amber-500 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6 lg:text-5xl">
            Sẵn sàng cho hành trình tiếp theo?
          </h2>
          <p className="text-xl text-amber-100 mb-10">
            Khám phá các tour du lịch tuyệt vời và bắt đầu cuộc phiêu lưu của bạn ngay hôm nay
          </p>
          <Link
            to="/"
            className="inline-block rounded-2xl bg-white px-10 py-5 text-lg font-bold text-amber-600 hover:bg-slate-900 hover:text-white transition-all duration-300 hover:shadow-2xl"
          >
            Khám phá tours ngay →
          </Link>
        </div>
      </section>
    </div>
  )
}
