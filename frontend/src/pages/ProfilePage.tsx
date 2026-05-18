import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { User, FileText, CheckCircle, Circle, Upload, Eye } from 'lucide-react'
import { userApi } from '@/api/user'
import { applicationApi } from '@/api/application'
import { useAuthStore } from '@/stores/authStore'
import { Link } from 'react-router-dom'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import dayjs from 'dayjs'

const KYC_STEPS = ['Chụp CCCD', 'Chân dung', 'Xác nhận OCR']

const DOC_LIST = [
  { type: 'CCCD', label: 'Căn cước công dân (Mặt trước/sau)', note: 'PDF, JPG, PNG (Max 5MB)' },
  { type: 'HOUSEHOLD_REGISTRATION', label: 'Sổ hộ khẩu hoặc Giấy CT07', note: 'Bản gốc hoặc bản sao có chứng thực' },
  { type: 'RESIDENCE_CERTIFICATE', label: 'Giấy xác nhận thực trạng nhà ở', note: 'Theo mẫu do UBND xã/phường cấp' },
  { type: 'INCOME_CERTIFICATE', label: 'Giấy xác nhận đối tượng và thu nhập', note: 'Yêu cầu ký tên đóng dấu của cơ quan' },
]

const inputCls = "w-full px-4 py-3 bg-[#f3f4f5] rounded-xl outline-none focus:ring-2 focus:ring-[#115cb9] text-[#191c1d] text-sm"

export default function ProfilePage() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)

  const { data: user, isLoading } = useQuery({
    queryKey: ['myInfo'],
    queryFn: () => userApi.getMyInfo().then((r) => r.data.result!),
  })

  const { data: applications } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationApi.getAll().then((r) => r.data.result || []),
  })

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    fullName: '', phoneNumber: '', occupation: '',
    incomePerMonth: '', householdSize: '',
  })

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        occupation: user.occupation || '',
        incomePerMonth: user.incomePerMonth?.toString() || '',
        householdSize: user.householdSize?.toString() || '',
      })
      setUser(user)
    }
  }, [user])

  const updateMutation = useMutation({
    mutationFn: () => userApi.updateProfile({
      fullName: form.fullName,
      phoneNumber: form.phoneNumber,
      occupation: form.occupation,
      incomePerMonth: form.incomePerMonth ? parseInt(form.incomePerMonth) : undefined,
      householdSize: form.householdSize ? parseInt(form.householdSize) : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myInfo'] })
      toast.success('Cập nhật thông tin thành công')
      setEditing(false)
    },
    onError: () => toast.error('Có lỗi xảy ra'),
  })

  const currentKycStep = user?.kycStatus === 'VERIFIED' ? 3 : user?.kycStatus === 'IN_PROGRESS' ? 2 : 1
  const currentApp = applications?.[0]

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-[#001f49] mb-3">Xác thực danh tính công dân</h1>
        <p className="text-[#44474e] max-w-2xl">Để đảm bảo tính minh bạch và công bằng trong quá trình bốc thăm Nhà ở Xã hội, vui lòng hoàn tất quy trình định danh điện tử (KYC).</p>
      </header>

      {/* KYC Stepper */}
      <div className="flex items-start justify-between relative max-w-3xl mx-auto mb-14">
        <div className="absolute top-5 left-0 w-full h-1 bg-[#e1e3e4] z-0" />
        <div className="absolute top-5 left-0 h-1 bg-[#115cb9] z-0" style={{ width: `${((currentKycStep - 1) / 2) * 100}%` }} />
        {KYC_STEPS.map((label, i) => (
          <div key={label} className="relative z-10 flex flex-col items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ring-4 ring-white ${
              i < currentKycStep ? 'bg-[#115cb9]' : 'bg-[#e1e3e4]'
            }`}>
              {i < currentKycStep ? <CheckCircle size={22} className="text-white" /> :
                <span className={`font-bold ${i + 1 === currentKycStep ? 'text-[#115cb9]' : 'text-[#44474e]'}`}>{i + 1}</span>}
            </div>
            <span className={`text-sm font-medium ${i < currentKycStep ? 'font-bold text-[#001f49]' : 'text-[#44474e]'}`}>
              {i === 0 ? 'Bước 1: Chụp CCCD' : i === 1 ? 'Bước 2: Chân dung' : 'Bước 3: Xác nhận OCR'}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#001f49] flex items-center gap-2">
                <User size={22} className="text-[#115cb9]" /> Thông tin cá nhân
              </h2>
              <button onClick={() => setEditing(!editing)}
                className="px-4 py-2 bg-[#f3f4f5] text-[#001f49] rounded-xl text-sm font-bold hover:bg-[#edeeef] transition-colors">
                {editing ? 'Hủy' : 'Chỉnh sửa'}
              </button>
            </div>

            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'fullName', label: 'Họ và tên', type: 'text' },
                  { key: 'phoneNumber', label: 'Số điện thoại', type: 'tel' },
                  { key: 'occupation', label: 'Nghề nghiệp', type: 'text' },
                  { key: 'incomePerMonth', label: 'Thu nhập / tháng', type: 'number' },
                  { key: 'householdSize', label: 'Số nhân khẩu', type: 'number' },
                ].map(({ key, label, type }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-[#44474e] uppercase mb-1">{label}</label>
                    <input type={type} value={form[key as keyof typeof form]}
                      onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className={inputCls} />
                  </div>
                ))}
                <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                  <button onClick={() => setEditing(false)} className="px-6 py-2 text-[#001f49] font-bold hover:bg-[#f3f4f5] rounded-xl transition-colors text-sm">
                    Hủy
                  </button>
                  <button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}
                    className="px-8 py-2 bg-[#001f49] text-white rounded-xl font-bold text-sm hover:bg-[#115cb9] transition-colors disabled:opacity-70">
                    {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Họ và tên', value: user?.fullName },
                  { label: 'Email', value: user?.email },
                  { label: 'Số điện thoại', value: user?.phoneNumber || '—' },
                  { label: 'Số CCCD', value: user?.cccdNumber || '—' },
                  { label: 'Ngày sinh', value: user?.dateOfBirth ? dayjs(user.dateOfBirth).format('DD/MM/YYYY') : '—' },
                  { label: 'Giới tính', value: user?.gender || '—' },
                  { label: 'Nghề nghiệp', value: user?.occupation || '—' },
                  { label: 'Thu nhập / tháng', value: user?.incomePerMonth ? `${user.incomePerMonth.toLocaleString()} VNĐ` : '—' },
                  { label: 'Số nhân khẩu', value: user?.householdSize?.toString() || '—' },
                  { label: 'Đối tượng ưu tiên', value: user?.priorityCategory || '—' },
                  { label: 'Tỉnh / Thành', value: user?.province || '—' },
                  { label: 'Quận / Huyện', value: user?.district || '—' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-bold text-[#44474e] uppercase mb-1">{label}</p>
                    <p className="text-[#191c1d] font-medium">{value}</p>
                  </div>
                ))}
              </div>
            )}

            {user?.kycStatus !== 'VERIFIED' && (
              <div className="mt-6 pt-6 border-t border-[#f3f4f5] flex justify-end">
                <Link to="/kyc"
                  className="px-8 py-3 bg-[#115cb9] text-white font-bold rounded-xl hover:bg-[#003471] transition-colors">
                  Tiếp tục xác thực KYC →
                </Link>
              </div>
            )}
          </motion.div>

          {/* Documents */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-[#001f49] flex items-center gap-2">
                <FileText size={22} className="text-[#115cb9]" /> Danh mục hồ sơ đính kèm
              </h2>
              <div className="text-right">
                <p className="text-xs font-bold text-[#44474e] uppercase">Tiến độ</p>
                <p className="text-xl font-black text-[#001f49]">
                  {currentApp?.documents?.length || 0} / {DOC_LIST.length}
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#f3f4f5]">
              <div className="grid grid-cols-12 px-4 py-3 bg-[#edeeef] text-[10px] font-bold text-[#44474e] uppercase tracking-widest">
                <div className="col-span-5">Tên loại giấy tờ</div>
                <div className="col-span-3">Trạng thái</div>
                <div className="col-span-4 text-right">Thao tác</div>
              </div>
              {DOC_LIST.map((doc) => {
                const uploaded = currentApp?.documents?.find(d => d.documentType === doc.type)
                return (
                  <div key={doc.type} className="grid grid-cols-12 px-4 py-4 items-center border-b border-[#f3f4f5] hover:bg-[#f3f4f5] transition-colors">
                    <div className="col-span-5">
                      <p className="text-sm font-semibold text-[#001f49]">{doc.label}</p>
                      <p className="text-[10px] text-[#44474e]">{doc.note}</p>
                    </div>
                    <div className="col-span-3">
                      {uploaded ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#d6e3ff] text-[#3f5881] text-[10px] font-bold">
                          <Circle size={6} className="fill-[#465f88]" /> ĐÃ NỘP
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#edeeef] text-[#44474e] text-[10px] font-bold">
                          <Circle size={6} className="fill-[#c4c6cf]" /> CHƯA NỘP
                        </span>
                      )}
                    </div>
                    <div className="col-span-4 flex justify-end gap-2">
                      {uploaded ? (
                        <>
                          <button className="p-2 hover:bg-white rounded-lg text-[#001f49] transition-all"><Eye size={18} /></button>
                          <button className="px-3 py-1.5 bg-[#e1e3e4] rounded-lg text-xs font-bold hover:bg-white transition-all">Tải lại</button>
                        </>
                      ) : (
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#115cb9] text-white rounded-lg text-xs font-bold hover:opacity-90 transition-all">
                          <Upload size={14} /> Upload
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 border-2 border-dashed border-[#c4c6cf]/50 rounded-xl p-8 flex flex-col items-center justify-center bg-[#f3f4f5]">
              <Upload size={36} className="text-[#001f49] mb-3" />
              <p className="text-sm font-bold text-[#001f49]">Kéo thả thêm các tài liệu hỗ trợ khác</p>
              <p className="text-xs text-[#44474e] mt-1">Hỗ trợ các file .zip, .rar cho hồ sơ bổ sung nhiều trang</p>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-[#001f49] mb-4 flex items-center gap-2">
              💡 Hướng dẫn chụp ảnh
            </h3>
            <div className="space-y-4">
              {[
                { icon: '☀️', title: 'Đủ ánh sáng', desc: 'Chụp ở nơi có ánh sáng tốt, không bị sương mù hoặc bóng đổ.' },
                { icon: '🔲', title: 'Không mất góc', desc: 'Đảm bảo 4 góc của thẻ CCCD nằm trọn trong khung hình.' },
                { icon: '🔍', title: 'Rõ nét', desc: 'Thông tin trên thẻ phải đọc được rõ ràng, không bị lóa bởi đèn flash.' },
              ].map((tip) => (
                <div key={tip.title} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#d6e3ff] flex items-center justify-center shrink-0 text-sm">
                    {tip.icon}
                  </div>
                  <p className="text-sm text-[#44474e]">
                    <span className="font-bold text-[#001f49]">{tip.title}:</span> {tip.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#001f49] text-white p-6 rounded-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Hỗ trợ trực tuyến</h3>
              <p className="text-xs text-blue-200 mb-4">Gặp khó khăn khi xác thực? Liên hệ tổng đài 24/7 để được hướng dẫn.</p>
              <button className="w-full py-2 bg-white text-[#001f49] font-bold rounded-xl text-sm hover:bg-blue-50 transition-colors">
                Gọi 1900 xxxx
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 text-9xl">🎧</div>
          </div>

          <div className="bg-[#f3f4f5] p-6 rounded-2xl flex items-start gap-3">
            <span className="text-[#115cb9]">ℹ️</span>
            <div>
              <h4 className="font-bold text-[#001f49] text-sm mb-1">Tại sao cần xác thực?</h4>
              <p className="text-sm text-[#44474e] leading-relaxed">Dữ liệu của bạn được mã hóa và bảo mật tuyệt đối theo tiêu chuẩn Chính phủ điện tử. Việc xác thực giúp loại bỏ hồ sơ ảo và đảm bảo quyền lợi cho người thu nhập thấp.</p>
            </div>
          </div>
        </aside>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-10 py-4 flex items-center justify-between z-40">
        <div className="hidden md:flex items-center gap-2 text-[#44474e]">
          <span className="text-sm">📝 Tiến trình hồ sơ được lưu tự động</span>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-[#e1e3e4] text-[#001f49] font-bold text-sm hover:bg-[#edeeef] transition-all">
            Lưu nháp
          </button>
          <button className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-[#001f49] text-white font-bold text-sm hover:bg-[#115cb9] shadow-lg transition-all">
            Gửi hồ sơ chính thức
          </button>
        </div>
      </div>
    </div>
  )
}
