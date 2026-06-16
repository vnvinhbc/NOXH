import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Building2, Calendar, ChevronRight, FileCheck2, MapPin, Newspaper, ShieldCheck, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import { projectApi } from '@/api/project'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import type { ProjectResponse } from '@/types'

const processSteps = [
  ['Dang ky', 'Tao ho so'],
  ['KYC', 'Dinh danh'],
  ['Nop ho so', 'Tai giay to'],
  ['Duyet', 'Admin xac minh'],
  ['Cap ma', 'Ma boc tham'],
  ['Boc tham', 'Theo doi live'],
  ['Ket qua', 'Audit cong khai'],
]

function ProjectCard({ project }: { project: ProjectResponse }) {
  const isOpen = project.status === 'OPEN'

  return (
    <motion.article whileHover={{ y: -4 }} className="overflow-hidden bg-white shadow-sm transition-shadow hover:shadow-lg">
      <div className="relative h-48 bg-gradient-to-br from-[#001f49] to-[#115cb9]">
        {project.imageUrl ? (
          <img src={project.imageUrl} alt={project.name} className="h-full w-full object-cover opacity-85" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Building2 size={84} className="text-white/35" />
          </div>
        )}
        <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-black ${isOpen ? 'bg-green-100 text-green-700' : 'bg-[#edeeef] text-[#44474e]'}`}>
          {isOpen ? 'Dang mo' : project.status}
        </span>
      </div>
      <div className="p-6">
        <h3 className="line-clamp-2 text-xl font-black text-[#001f49]">{project.name}</h3>
        <div className="mt-4 space-y-3 text-sm text-[#44474e]">
          {project.location && (
            <p className="flex items-center gap-2">
              <MapPin size={15} className="shrink-0 text-[#115cb9]" />
              <span className="line-clamp-1">{project.location}</span>
            </p>
          )}
          <p className="flex items-center gap-2">
            <Users size={15} className="text-[#115cb9]" />
            {project.availableUnits?.toLocaleString('vi-VN') || 0} / {project.totalUnits?.toLocaleString('vi-VN') || 0} can kha dung
          </p>
          {project.registrationEnd && (
            <p className="flex items-center gap-2">
              <Calendar size={15} className="text-[#115cb9]" />
              Han nop: {dayjs(project.registrationEnd).format('DD/MM/YYYY')}
            </p>
          )}
        </div>
        <Link to="/profile" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#001f49] px-4 py-3 text-sm font-black text-white transition-colors hover:bg-[#115cb9]">
          Dang ky ho so
          <ChevronRight size={16} />
        </Link>
      </div>
    </motion.article>
  )
}

export default function ProjectsPage() {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectApi.getAll().then((res) => res.data.result || []),
  })

  const featuredProject = projects[0]

  return (
    <div>
      <section className="relative flex min-h-[34rem] items-center overflow-hidden">
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#001f49] via-[#001f49]/85 to-[#001f49]/30" />
        <div className="absolute inset-0 bg-[#001f49]">
          {featuredProject?.imageUrl ? (
            <img src={featuredProject.imageUrl} alt={featuredProject.name} className="h-full w-full object-cover opacity-35" />
          ) : (
            <div className="flex h-full items-center justify-center opacity-20">
              <Building2 size={220} className="text-white" />
            </div>
          )}
        </div>
        <div className="relative z-20 mx-auto w-full max-w-6xl px-6 text-white">
          <div className="max-w-3xl">
            <span className="mb-6 inline-flex rounded-full bg-white/18 px-4 py-1 text-sm font-bold backdrop-blur">
              Cong thong tin nha o xa hoi
            </span>
            <h1 className="text-5xl font-black leading-tight tracking-tight md:text-6xl">
              {featuredProject?.name || 'Du an nha o xa hoi'}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/82">
              Theo doi du an, nop ho so va tham gia boc tham minh bach tren cung mot cong thong tin.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/profile" className="inline-flex items-center gap-2 rounded-xl bg-[#115cb9] px-8 py-4 text-lg font-black text-white shadow-lg transition-colors hover:bg-[#003471]">
                Bat dau nop ho so
                <ChevronRight size={20} />
              </Link>
              <Link to="/results-audit" className="inline-flex items-center gap-2 rounded-xl bg-white/12 px-8 py-4 text-lg font-black text-white backdrop-blur transition-colors hover:bg-white/20">
                Xem audit
                <ShieldCheck size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#115cb9]">Project archive</p>
          <h2 className="mt-2 text-3xl font-black text-[#001f49]">Cac du an dang mo</h2>
        </div>
        {isLoading ? (
          <LoadingSpinner size="lg" />
        ) : projects.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
          </div>
        ) : (
          <div className="bg-white px-6 py-16 text-center text-[#44474e] shadow-sm">
            <Building2 size={48} className="mx-auto mb-4 text-[#c4c6cf]" />
            Chua co du an dang mo.
          </div>
        )}
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black uppercase tracking-tight text-[#001f49]">Quy trinh boc tham va xet duyet</h2>
            <p className="mx-auto mt-3 max-w-2xl text-[#44474e]">Moi buoc trong quy trinh deu duoc ghi nhan va co the doi chieu bang audit hash.</p>
          </div>
          <div className="relative grid gap-5 md:grid-cols-7">
            <div className="absolute left-0 top-6 hidden h-1 w-full bg-[#e7e8e9] md:block" />
            {processSteps.map(([label, desc], index) => (
              <div key={label} className="relative z-10 text-center">
                <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full text-sm font-black ring-4 ring-white ${index === 0 ? 'bg-[#001f49] text-white' : 'bg-[#e7e8e9] text-[#44474e]'}`}>
                  {index + 1}
                </div>
                <p className="text-sm font-black text-[#001f49]">{label}</p>
                <p className="mt-1 text-xs text-[#6b7280]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#115cb9]">Updates</p>
            <h2 className="mt-2 text-3xl font-black text-[#001f49]">Tin tuc va thong bao</h2>
          </div>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            ['Huong dan nop ho so NOXH truc tuyen', 'Cap nhat cac loai giay to can chuan bi truoc khi gui ho so.'],
            ['Cong khai quy trinh boc tham', 'Nguoi dan co the tai JSON va verify lai seed, hash, ket qua.'],
            ['Kiem tra nhom uu tien', 'He thong phan nhom uu tien theo doi tuong uu tien da khai bao.'],
          ].map(([title, desc]) => (
            <article key={title} className="bg-white p-6 shadow-sm">
              <Newspaper size={32} className="mb-5 text-[#115cb9]" />
              <h3 className="text-lg font-black text-[#001f49]">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#44474e]">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="bg-[#003471] p-10 text-center text-white">
          <FileCheck2 size={42} className="mx-auto mb-5 text-[#acc7ff]" />
          <h2 className="text-4xl font-black">San sang nop ho so?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-blue-100">Hoan thien thong tin ca nhan, tai giay to va theo doi toan bo tien do tren dashboard.</p>
          <Link to="/profile" className="mt-8 inline-flex rounded-2xl bg-white px-10 py-4 text-lg font-black text-[#001f49]">
            Nop ho so ngay
          </Link>
        </div>
      </section>
    </div>
  )
}
