import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Camera, Scan, FileText, ChevronRight } from 'lucide-react'
import { userApi } from '@/api/user'
import { provinceApi } from '@/api/province'
import type { Province } from '@/types'

const schema = z.object({
  fullName: z.string().min(2, 'Họ tên không hợp lệ'),
  cccdNumber: z.string().min(9, 'Số CCCD không hợp lệ'),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  permanentAddress: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  ward: z.string().optional(),
  occupation: z.string().optional(),
  incomePerMonth: z.string().optional(),
  householdSize: z.string().optional(),
  priorityCategory: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function KycPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<{ code: number; name: string }[]>([])
  const [wards, setWards] = useState<{ code: number; name: string }[]>([])
  const navigate = useNavigate()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const selectedProvince = watch('province')
  const selectedDistrict = watch('district')

  useEffect(() => {
    provinceApi.getAll().then((res) => {
      setProvinces((res.data.result as unknown as Province[]) || [])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedProvince) {
      const code = parseInt(selectedProvince)
      provinceApi.getDistricts(code).then((res) => {
        const data = res.data.result as unknown as { districts?: { code: number; name: string }[] }
        setDistricts(data?.districts || [])
        setWards([])
      }).catch(() => {})
    }
  }, [selectedProvince])

  useEffect(() => {
    if (selectedDistrict) {
      const code = parseInt(selectedDistrict)
      provinceApi.getWards(code).then((res) => {
        const data = res.data.result as unknown as { wards?: { code: number; name: string }[] }
        setWards(data?.wards || [])
      }).catch(() => {})
    }
  }, [selectedDistrict])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const provinceObj = provinces.find(p => p.code === parseInt(data.province || '0'))
      const districtObj = districts.find(d => d.code === parseInt(data.district || '0'))
      const wardObj = wards.find(w => w.code === parseInt(data.ward || '0'))

      await userApi.submitKyc({
        fullName: data.fullName,
        cccdNumber: data.cccdNumber,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        permanentAddress: data.permanentAddress,
        province: provinceObj?.name || data.province,
        district: districtObj?.name || data.district,
        ward: wardObj?.name || data.ward,
        occupation: data.occupation,
        incomePerMonth: data.incomePerMonth ? parseInt(data.incomePerMonth) : undefined,
        householdSize: data.householdSize ? parseInt(data.householdSize) : undefined,
        priorityCategory: data.priorityCategory,
      })
      toast.success('Xác thực danh tính thành công!')
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { num: 1, label: 'Chụp CCCD', icon: Camera },
    { num: 2, label: 'Chân dung', icon: Scan },
    { num: 3, label: 'Xác nhận OCR', icon: FileText },
  ]

  const inputCls = "w-full px-4 py-3 bg-[#f3f4f5] rounded-xl outline-none focus:ring-2 focus:ring-[#115cb9] text-[#191c1d] text-sm"
  const selectCls = "w-full px-4 py-3 bg-[#f3f4f5] rounded-xl outline-none focus:ring-2 focus:ring-[#115cb9] text-[#191c1d] text-sm"

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#001f49] mb-3">Xác thực danh tính công dân</h1>
        <p className="text-[#44474e] max-w-2xl">Để đảm bảo tính minh bạch và công bằng trong quá trình bốc thăm Nhà ở Xã hội, vui lòng hoàn tất quy trình định danh điện tử (KYC).</p>
      </header>

      {/* Stepper */}
      <div className="flex items-start justify-between relative max-w-2xl mx-auto mb-12">
        <div className="absolute top-5 left-0 w-full h-1 bg-[#e1e3e4] -translate-y-1/2 z-0" />
        <div className="absolute top-5 left-0 h-1 bg-[#115cb9] -translate-y-1/2 z-0 transition-all duration-500"
             style={{ width: `${((step - 1) / 2) * 100}%` }} />
        {steps.map(({ num, label, icon: Icon }) => (
          <div key={num} className="relative z-10 flex flex-col items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ring-4 ring-white transition-all ${
              step > num ? 'bg-[#115cb9]' : step === num ? 'bg-[#115cb9]' : 'bg-[#e1e3e4]'
            }`}>
              {step > num ? <CheckCircle size={22} className="text-white" /> : <Icon size={22} className={step >= num ? 'text-white' : 'text-[#44474e]'} />}
            </div>
            <span className={`text-sm font-medium ${step >= num ? 'font-bold text-[#001f49]' : 'text-[#44474e]'}`}>{label}</span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-sm p-8 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-[#001f49] mb-6 flex items-center gap-2">
              <Camera size={24} className="text-[#115cb9]" /> Tải lên Căn cước công dân
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {['Mặt trước', 'Mặt sau'].map((side) => (
                <div key={side}>
                  <label className="block text-sm font-bold text-[#001f49] mb-3">{side} thẻ CCCD</label>
                  <div className="aspect-[1.6/1] w-full border-2 border-dashed border-[#c4c6cf] rounded-xl flex flex-col items-center justify-center bg-[#f3f4f5] cursor-pointer hover:bg-[#edeeef] transition-colors">
                    <Camera size={36} className="text-[#115cb9] mb-2" />
                    <p className="text-sm font-medium text-[#001f49]">Bấm để chụp hoặc tải lên</p>
                    <p className="text-xs text-[#44474e] mt-1">Hỗ trợ JPG, PNG, PDF</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button onClick={() => setStep(2)}
                className="flex items-center gap-2 px-8 py-3 bg-[#115cb9] text-white font-bold rounded-xl hover:bg-[#003471] transition-colors">
                Tiếp tục <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-sm p-8 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-[#001f49] mb-6 flex items-center gap-2">
              <Scan size={24} className="text-[#115cb9]" /> Chụp ảnh chân dung
            </h2>
            <div className="aspect-square max-w-xs mx-auto border-2 border-dashed border-[#c4c6cf] rounded-2xl flex flex-col items-center justify-center bg-[#f3f4f5] mb-8 cursor-pointer hover:bg-[#edeeef] transition-colors">
              <Scan size={48} className="text-[#115cb9] mb-3" />
              <p className="text-sm font-medium text-[#001f49]">Chụp ảnh khuôn mặt</p>
              <p className="text-xs text-[#44474e] mt-1">Nhìn thẳng, đủ ánh sáng</p>
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="px-6 py-3 text-[#001f49] font-bold hover:bg-[#f3f4f5] rounded-xl transition-colors">
                Quay lại
              </button>
              <button onClick={() => setStep(3)}
                className="flex items-center gap-2 px-8 py-3 bg-[#115cb9] text-white font-bold rounded-xl hover:bg-[#003471] transition-colors">
                Tiếp tục <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-xl font-bold text-[#001f49] mb-6 flex items-center gap-2">
                <FileText size={24} className="text-[#115cb9]" /> Xác nhận thông tin từ CCCD
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#44474e] uppercase mb-1">Họ và tên *</label>
                  <input {...register('fullName')} placeholder="Nguyễn Văn An" className={inputCls} />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#44474e] uppercase mb-1">Số CCCD *</label>
                  <input {...register('cccdNumber')} placeholder="012345678901" className={inputCls} />
                  {errors.cccdNumber && <p className="text-red-500 text-xs mt-1">{errors.cccdNumber.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#44474e] uppercase mb-1">Ngày sinh</label>
                  <input {...register('dateOfBirth')} type="date" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#44474e] uppercase mb-1">Giới tính</label>
                  <select {...register('gender')} className={selectCls}>
                    <option value="">Chọn</option>
                    <option value="NAM">Nam</option>
                    <option value="NU">Nữ</option>
                    <option value="KHAC">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#44474e] uppercase mb-1">Đối tượng ưu tiên</label>
                  <select {...register('priorityCategory')} className={selectCls}>
                    <option value="">Chọn đối tượng</option>
                    <option value="CONG_CHUC">Công chức, viên chức</option>
                    <option value="NGUOI_CO_CONG">Người có công với cách mạng</option>
                    <option value="HO_NGHEO">Hộ nghèo, cận nghèo</option>
                    <option value="CONG_NHAN">Công nhân lao động</option>
                    <option value="KHAC">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#44474e] uppercase mb-1">Tỉnh / Thành phố</label>
                  <select {...register('province')} className={selectCls}>
                    <option value="">Chọn tỉnh thành</option>
                    {provinces.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#44474e] uppercase mb-1">Quận / Huyện</label>
                  <select {...register('district')} className={selectCls} disabled={!selectedProvince}>
                    <option value="">Chọn quận huyện</option>
                    {districts.map((d) => <option key={d.code} value={d.code}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#44474e] uppercase mb-1">Phường / Xã</label>
                  <select {...register('ward')} className={selectCls} disabled={!selectedDistrict}>
                    <option value="">Chọn phường xã</option>
                    {wards.map((w) => <option key={w.code} value={w.code}>{w.name}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#44474e] uppercase mb-1">Địa chỉ thường trú</label>
                  <input {...register('permanentAddress')} placeholder="Số nhà, tên đường..." className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#44474e] uppercase mb-1">Nghề nghiệp</label>
                  <input {...register('occupation')} placeholder="Công chức nhà nước" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#44474e] uppercase mb-1">Thu nhập / tháng (VNĐ)</label>
                  <input {...register('incomePerMonth')} type="number" placeholder="12000000" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#44474e] uppercase mb-1">Số nhân khẩu</label>
                  <input {...register('householdSize')} type="number" placeholder="4" className={inputCls} />
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button type="button" onClick={() => setStep(2)} className="px-6 py-3 text-[#001f49] font-bold hover:bg-[#f3f4f5] rounded-xl transition-colors">
                  Quay lại
                </button>
                <button type="submit" disabled={loading}
                  className="flex items-center gap-2 px-10 py-3 bg-[#115cb9] text-white font-bold rounded-xl hover:bg-[#003471] transition-colors disabled:opacity-70">
                  {loading ? 'Đang xử lý...' : 'Hoàn tất xác thực'} <CheckCircle size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
