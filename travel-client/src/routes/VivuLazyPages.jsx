import { lazy, Suspense } from 'react'

const CarsPage = lazy(() => import('../pages/VivuServicePages').then((module) => ({ default: module.CarsPage })))
const CommunityPage = lazy(() => import('../pages/VivuServicePages').then((module) => ({ default: module.CommunityPage })))
const FlightsPage = lazy(() => import('../pages/VivuServicePages').then((module) => ({ default: module.FlightsPage })))
const HotelsPage = lazy(() => import('../pages/VivuServicePages').then((module) => ({ default: module.HotelsPage })))
const PlannerPage = lazy(() => import('../pages/VivuServicePages').then((module) => ({ default: module.PlannerPage })))

function PageFallback() {
  return <div className="container-x py-24 text-center text-ink-500">Đang tải trang…</div>
}

export function CarsRoute() {
  return <Suspense fallback={<PageFallback />}><CarsPage /></Suspense>
}

export function CommunityRoute() {
  return <Suspense fallback={<PageFallback />}><CommunityPage /></Suspense>
}

export function FlightsRoute() {
  return <Suspense fallback={<PageFallback />}><FlightsPage /></Suspense>
}

export function HotelsRoute() {
  return <Suspense fallback={<PageFallback />}><HotelsPage /></Suspense>
}

export function PlannerRoute() {
  return <Suspense fallback={<PageFallback />}><PlannerPage /></Suspense>
}