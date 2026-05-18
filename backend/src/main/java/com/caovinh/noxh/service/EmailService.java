package com.caovinh.noxh.service;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EmailService {

    JavaMailSender mailSender;

    @NonFinal
    @Value("${app.mail.from}")
    String fromEmail;

    @NonFinal
    @Value("${app.mail.from-name}")
    String fromName;

    @Async
    public void sendOtpEmail(String toEmail, String otp, String fullName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("[NOXH] Mã OTP đặt lại mật khẩu");
            helper.setText(buildOtpEmailHtml(fullName, otp), true);

            mailSender.send(message);
            log.info("OTP email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildOtpEmailHtml(String fullName, String otp) {
        return """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                  <meta charset="UTF-8"/>
                  <style>
                    body { font-family: 'Inter', Arial, sans-serif; background: #f8f9fa; margin: 0; padding: 20px; }
                    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
                    .header { background: #001f49; padding: 32px; text-align: center; }
                    .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; }
                    .header p { color: #acc7ff; margin: 8px 0 0; font-size: 13px; }
                    .body { padding: 40px 32px; }
                    .greeting { color: #191c1d; font-size: 16px; margin-bottom: 16px; }
                    .desc { color: #44474e; font-size: 14px; line-height: 1.6; margin-bottom: 32px; }
                    .otp-box { background: #f3f4f5; border: 2px solid #115cb9; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px; }
                    .otp-label { color: #44474e; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
                    .otp-code { color: #001f49; font-size: 42px; font-weight: 900; letter-spacing: 8px; }
                    .otp-expire { color: #74777f; font-size: 12px; margin-top: 8px; }
                    .warning { background: #ffdad6; border-radius: 8px; padding: 16px; color: #93000a; font-size: 13px; line-height: 1.5; }
                    .footer { background: #f3f4f5; padding: 24px 32px; text-align: center; }
                    .footer p { color: #74777f; font-size: 11px; margin: 4px 0; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>🏠 Hệ thống NOXH</h1>
                      <p>Cổng thông tin Nhà ở Xã hội - Chính phủ điện tử</p>
                    </div>
                    <div class="body">
                      <p class="greeting">Xin chào <strong>%s</strong>,</p>
                      <p class="desc">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn trên Hệ thống bốc thăm Nhà ở Xã hội. Vui lòng sử dụng mã OTP dưới đây:</p>
                      <div class="otp-box">
                        <div class="otp-label">Mã OTP của bạn</div>
                        <div class="otp-code">%s</div>
                        <div class="otp-expire">⏱ Mã có hiệu lực trong 5 phút</div>
                      </div>
                      <div class="warning">
                        ⚠️ <strong>Lưu ý bảo mật:</strong> Không chia sẻ mã OTP này với bất kỳ ai, kể cả nhân viên hỗ trợ. Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
                      </div>
                    </div>
                    <div class="footer">
                      <p>© 2024 Cổng thông tin Nhà ở Xã hội - Chính phủ điện tử</p>
                      <p>Đơn vị vận hành: Bộ Xây dựng phối hợp Trung tâm Dữ liệu Quốc gia</p>
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(fullName, otp);
    }
}
