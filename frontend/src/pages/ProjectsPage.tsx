import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Building2, MapPin, Calendar, Clock, Users, ChevronRight, Newspaper } from 'lucide-react'
import { projectApi } from '@/api/project'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import type { ProjectResponse } from '@/types'

const PROCESS_STEPS = [
  { num: 1, label: 'Đăng ký', desc: 'Tạo tài khoản' },
  { num: 2, label: 'KYC', desc: 'Định danh VNeID' },
  { num: 3, label: 'Nộp hồ sơ', desc: 'Tải tài liệu PDF' },
  { num: 4, label: 'Duyệt', desc: 'Hội đồng thẩm định' },
  { num: 5, label: 'Cấp mã', desc: 'Số thứ tự bốc' },
  { num: 6, label: 'Bốc thăm', desc: 'Trực tiếp Livestream' },
  { num: 7, label: 'Kết quả', desc: 'Công bố niêm yết' },
]

function ProjectCard({ project }: { project: ProjectResponse }) {
  const statusColor = project.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
  const statusLabel = project.status === 'OPEN' ? 'Đang mở' : project.status === 'CLOSED' ? 'Đã đóng' : 'Hoàn thành'

  return (
    <motion.div whileHover={{ y: -4 }} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gradient-to-br from-[#001f49] to-[#115cb9] relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <Building2 size={80} className="text-white" />
        </div>
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>{statusLabel}</span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-bold text-[#001f49] mb-3 line-clamp-2">{project.name}</h3>
        <div className="space-y-2 mb-4">
          {project.location && (
            <div className="flex items-center gap-2 text-sm text-[#44474e]">
              <MapPin size={14} className="text-[#115cb9] shrink-0" />
              <span className="line-clamp-1">{project.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-[#44474e]">
            <Users size={14} className="text-[#115cb9]" />
            <span>{project.totalUnits?.toLocaleString()} căn hộ</span>
          </div>
          {project.pricePerSqm && (
            <div className="flex items-center gap-2 text-sm text-[#44474e]">
              <span className="text-[#115cb9] font-bold text-xs">₫</span>
              <span>{(project.pricePerSqm / 1000000).toFixed(0)}-{((project.pricePerSqm + 2000000) / 1000000).toFixed(0)} tr/m²</span>
            </div>
          )}
          {project.registrationEnd && (
            <div className="flex items-center gap-2 text-sm text-[#44474e]">
              <Calendar size={14} className="text-[#115cb9]" />
              <span>HSD nộp hồ sơ: {dayjs(project.registrationEnd).format('DD/MM/YYYY')}</span>
            </div>
          )}
          {project.daysRemaining !== undefined && project.daysRemaining > 0 && (
            <div className="flex items-center gap-1 text-xs font-bold text-red-600">
              <Clock size={12} />
              Còn {project.daysRemaining} ngày
            </div>
          )}
        </div>
        <Link to={`/profile`}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#001f49] text-white rounded-xl font-bold text-sm hover:bg-[#115cb9] transition-colors">
          Đăng ký hồ sơ <ChevronRight size={16} />
        </Link>
      </div>
    </motion.div>
  )
}

export default function ProjectsPage() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectApi.getAll().then((r) => r.data.result || []),
  })

  const featuredProject = projects?.[0]

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[500px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#001f49] via-[#001f49]/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-[#001f49]">
          <div className="w-full h-full opacity-20 flex items-center justify-center">
            <Building2 size={200} className="text-white" />
          </div>
        </div>
        <div className="container mx-auto px-6 relative z-20 text-white max-w-6xl">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-sm font-medium mb-6">
              Chương trình quốc gia 2024
            </span>
            <h1 className="text-4xl md:text-5xl font-black mb-5 leading-tight tracking-tight">
              {featuredProject?.name || 'Dự án Nhà ở Xã hội Green Sky'}
              {' '}— Mái ấm bền vững cho người dân
            </h1>
            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              Hiện thực hóa giấc mơ an cư với hạ tầng đồng bộ, không gian sống xanh và chính sách hỗ trợ tài chính ưu việt từ Chính phủ.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/profile" className="flex items-center gap-2 bg-[#115cb9] hover:bg-[#003471] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all">
                Đăng ký nộp hồ sơ ngay <ChevronRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20 container mx-auto px-6 max-w-6xl">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-[#001f49] mb-2">Các dự án đang mở</h2>
          <div className="w-20 h-1.5 bg-[#115cb9] rounded-full" />
        </div>
        {isLoading ? (
          <LoadingSpinner size="lg" />
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-[#44474e]">
            <Building2 size={48} className="mx-auto mb-4 opacity-30" />
            <p>Hiện chưa có dự án nào đang mở</p>
          </div>
        )}
      </section>

      {/* Process Steps */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-[#001f49] mb-4 uppercase tracking-tight">Quy trình bốc thăm &amp; xét duyệt</h2>
            <p className="text-[#44474e] max-w-2xl mx-auto">Hệ thống minh bạch, công bằng, được giám sát trực tiếp bởi Sở Xây dựng và các đơn vị kiểm toán độc lập.</p>
          </div>
          <div className="relative flex justify-between items-start">
            <div className="absolute top-6 left-0 w-full h-1 bg-[#e7e8e9] z-0" />
            {PROCESS_STEPS.map((s, i) => (
              <div key={s.num} className="flex-1 flex flex-col items-center text-center relative z-10">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mb-3 ring-4 ring-white ${i === 0 ? 'bg-[#001f49] text-white shadow-lg' : 'bg-[#e7e8e9] text-[#44474e]'}`}>
                  {s.num}
                </div>
                <h4 className={`text-xs font-bold ${i === 0 ? 'text-[#001f49]' : 'text-[#44474e]'}`}>{s.label}</h4>
                <p className="text-[10px] text-[#44474e] mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News */}
      <section className="py-20 bg-[#f8f9fa]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-[#001f49] mb-2">Tin tức &amp; Thông báo</h2>
              <p className="text-[#44474e]">Cập nhật mới nhất từ Sở Xây dựng và Ban quản lý dự án</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { tag: 'Văn bản mới', date: '12/10/2024', title: 'Hướng dẫn chi tiết cách thức xác nhận đối tượng cư trú khi nộp hồ sơ NOXH', desc: 'Các quy định mới về giấy tờ xác nhận tạm trú và hộ khẩu đã được đơn giản hóa...' },
              { tag: 'Thông báo', date: '10/10/2024', title: 'Danh sách các ngân hàng hỗ trợ gói vay ưu đãi lãi suất 4.8% cho dự án Green Sky', desc: 'Ngân hàng Chính sách xã hội phối hợp cùng 4 ngân hàng thương mại công bố...' },
              { tag: 'Giám sát', date: '08/10/2024', title: 'Quy trình Audit hồ sơ: Đảm bảo 100% hồ sơ được xét duyệt công tâm', desc: 'Sở Xây dựng triển khai hệ thống phần mềm lọc hồ sơ tự động...' },
            ].map((news) => (
              <motion.article key={news.title} whileHover={{ y: -4 }} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
                <div className="h-48 bg-gradient-to-br from-[#edeeef] to-[#e1e3e4] relative flex items-center justify-center">
                  <Newspaper size={48} className="text-[#c4c6cf]" />
                  <span className="absolute top-4 left-4 bg-[#001f49] text-white text-[10px] font-black uppercase px-2 py-1 rounded">
                    {news.tag}
                  </span>
                </div>
                <div className="p-6">
                  <time className="text-xs text-[#44474e] font-medium">{news.date}</time>
                  <h3 className="text-base font-bold text-[#001f49] mt-2 mb-3 line-clamp-2 hover:text-[#115cb9] transition-colors cursor-pointer">
                    {news.title}
                  </h3>
                  <p className="text-sm text-[#44474e] line-clamp-2">{news.desc}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 container mx-auto px-6 max-w-6xl">
        <div className="bg-[#003471] rounded-3xl p-12 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-6">Bạn đã sẵn sàng để trở thành cư dân của Green Sky?</h2>
            <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">Đừng bỏ lỡ cơ hội sở hữu căn hộ mơ ước. Thời gian đăng ký có hạn.</p>
            <Link to="/profile" className="inline-block bg-white text-[#001f49] hover:bg-blue-50 px-10 py-5 rounded-2xl font-black text-xl transition-all shadow-xl">
              Bắt đầu nộp hồ sơ ngay
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
