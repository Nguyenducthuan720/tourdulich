import { Link } from 'react-router-dom'
import { Icon } from '../components/icons'

const values = [
  { icon: 'spark', title: 'Chất lượng', desc: 'Cam kết dịch vụ cao cấp, trải nghiệm hoàn hảo cho mỗi chuyến đi' },
  { icon: 'check', title: 'An toàn', desc: 'Bảo hiểm toàn diện, hỗ trợ 24/7 trong suốt hành trình' },
  { icon: 'heart', title: 'Giá trị', desc: 'Mức giá cạnh tranh, nhiều ưu đãi đặc biệt cho khách hàng thân thiết' },
  { icon: 'star', title: 'Bền vững', desc: 'Du lịch có trách nhiệm, góp phần bảo vệ môi trường và văn hóa địa phương' },
]

const stats = [
  { number: '18+', label: 'Tour du lịch' },
  { number: '1000+', label: 'Khách hàng hài lòng' },
  { number: '50+', label: 'Điểm đến' },
  { number: '5★', label: 'Đánh giá trung bình' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="relative h-[480px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80"
          alt="About Hero"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/75 via-ink-900/55 to-ink-900/85"></div>
        <div className="container-x relative z-10 pt-32">
          <div className="max-w-3xl">
            <p className="eyebrow mb-4 text-brand-200">Về chúng tôi</p>
            <h1 className="font-display text-5xl font-semibold tracking-tight text-white lg:text-7xl">
              Câu chuyện
              <span className="block italic text-brand-300">Tour Lượng</span>
            </h1>
            <p className="mt-6 text-xl text-ink-100/90">
              Kết nối những chuyến đi, tạo nên những kỷ niệm đáng nhớ.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="container-x py-24">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-4">Hành trình</p>
            <h2 className="section-title">Từ đam mê đến sứ mệnh</h2>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink-500">
              <p>
                Tour Lượng được thành lập từ niềm đam mê du lịch và mong muốn mang
                đến những trải nghiệm tốt nhất cho khách hàng Việt Nam.
              </p>
              <p>
                Chúng tôi hiểu rằng mỗi chuyến đi không chỉ là việc di chuyển, mà
                là hành trình khám phá, trải nghiệm và tạo nên những kỷ niệm vô giá.
              </p>
              <p>
                Với đội ngũ chuyên nghiệp và đối tác uy tín, Tour Lượng cam kết
                dịch vụ đẳng cấp từ khâu tư vấn đến khi kết thúc hành trình.
              </p>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"
              alt="Story"
              className="rounded-3xl shadow-lift"
            />
            <div className="absolute -bottom-6 -left-6 rounded-2xl bg-brand-500 p-8 text-white shadow-lift">
              <p className="font-display text-5xl font-bold">5+</p>
              <p className="text-sm font-semibold uppercase tracking-wider">
                Năm kinh nghiệm
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-ink-900 py-20">
        <div className="container-x">
          <div className="grid gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-5xl font-bold text-brand-400">{stat.number}</p>
                <p className="mt-3 text-lg font-medium text-ink-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container-x py-24">
        <div className="mb-16 max-w-2xl">
          <p className="eyebrow mb-4">Giá trị cốt lõi</p>
          <h2 className="section-title">Chúng tôi tin vào điều gì</h2>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <div key={value.title} className="card card-hover p-8">
              <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <Icon name={value.icon} className="h-8 w-8" />
              </div>
              <h3 className="font-display text-xl font-semibold text-ink-900">{value.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-white py-24">
        <div className="container-x">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl bg-gradient-to-br from-brand-50 to-brand-100 p-10 ring-1 ring-brand-200">
              <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-brand-500 text-white">
                <Icon name="spark" className="h-8 w-8" />
              </div>
              <h3 className="font-display text-3xl font-semibold text-ink-900">Sứ mệnh</h3>
              <p className="mt-4 text-lg leading-relaxed text-ink-600">
                Mang đến những trải nghiệm du lịch đẳng cấp, kết nối con người với
                thiên nhiên và văn hóa, tạo nên những kỷ niệm đáng nhớ cho mỗi khách hàng.
              </p>
            </div>
            <div className="rounded-3xl bg-ink-50 p-10 ring-1 ring-ink-200">
              <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-ink-900 text-white">
                <Icon name="star" className="h-8 w-8" />
              </div>
              <h3 className="font-display text-3xl font-semibold text-ink-900">Tầm nhìn</h3>
              <p className="mt-4 text-lg leading-relaxed text-ink-600">
                Trở thành nền tảng đặt tour du lịch hàng đầu Việt Nam, tiên phong
                ứng dụng công nghệ để mang đến dịch vụ hoàn hảo nhất.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-500 py-20">
        <div className="container-x max-w-4xl text-center">
          <h2 className="font-display text-4xl font-semibold text-white lg:text-5xl">
            Sẵn sàng cho hành trình tiếp theo?
          </h2>
          <p className="mt-4 text-xl text-brand-100">
            Khám phá các tour du lịch tuyệt vời và bắt đầu cuộc phiêu lưu của bạn.
          </p>
          <Link to="/" className="btn mt-10 bg-white text-brand-600 hover:bg-ink-900 hover:text-white">
            Khám phá tours ngay
            <Icon name="arrowRight" className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
