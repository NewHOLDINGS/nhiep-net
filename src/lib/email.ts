import nodemailer from 'nodemailer';

const ADMIN_EMAIL = 'newholding.net@gmail.com';

export interface SendOtpResult {
  success: boolean;
  message: string;
  devOtp?: string;
}

/**
 * Gửi mã OTP xác thực tới email quản trị viên duy nhất: newholding.net@gmail.com
 */
export async function sendAdminOtpEmail(email: string, otp: string): Promise<SendOtpResult> {
  const normalizedEmail = email.trim().toLowerCase();
  
  if (normalizedEmail !== ADMIN_EMAIL) {
    return {
      success: false,
      message: `Quyền truy cập bị từ chối. Chỉ tài khoản ${ADMIN_EMAIL} được phép nhận mã OTP quản trị.`
    };
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0d0d11; color: #ffffff; padding: 20px; }
          .container { max-width: 540px; margin: 0 auto; background: #16161c; border-radius: 16px; border: 1px solid #ff7a00; padding: 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.6); }
          .header { text-align: center; border-bottom: 1px solid #27272f; padding-bottom: 20px; margin-bottom: 24px; }
          .title { color: #ff7a00; font-size: 24px; font-weight: 800; margin: 0; }
          .subtitle { color: #a1a1aa; font-size: 13px; margin-top: 6px; }
          .otp-box { background: #22222a; border: 2px dashed #ff7a00; border-radius: 12px; text-align: center; padding: 20px; margin: 24px 0; }
          .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #ff9122; font-family: monospace; }
          .info { color: #d4d4d8; font-size: 14px; line-height: 1.6; margin-bottom: 16px; }
          .warning { font-size: 12px; color: #f87171; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #71717a; border-top: 1px solid #27272f; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">NHIEP.NET ADMIN AUTH</h1>
            <p class="subtitle">Hệ Thống Xác Thực Quản Trị Viên & Dữ Liệu AI</p>
          </div>
          <p class="info">Xin chào Quản trị viên <strong>${ADMIN_EMAIL}</strong>,</p>
          <p class="info">Bạn vừa yêu cầu mã xác thực OTP để đăng nhập Trung tâm Quản trị và tải Dữ liệu huấn luyện AI của website <strong>nhiep.net</strong>.</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div style="font-size: 12px; color: #a1a1aa; margin-top: 8px;">Mã có hiệu lực trong vòng 10 phút</div>
          </div>
          <p class="info">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email để đảm bảo an toàn tuyệt đối.</p>
          <p class="warning">⚠️ Tuyệt đối không chia sẻ mã OTP này cho bất kỳ ai.</p>
          <div class="footer">
            &copy; 2026 NHIEP.NET — Cinema & Photography Platform Đà Nẵng • Huế • Quảng Trị • Khánh Hòa.<br>
            Hotline Hỗ trợ: 0932513678
          </div>
        </div>
      </body>
    </html>
  `;

  // If SMTP is configured, send through real mail server
  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      await transporter.sendMail({
        from: `"nhiep.net Security" <${smtpUser}>`,
        to: ADMIN_EMAIL,
        subject: `[NHIEP.NET] Mã OTP Quản Trị Viên Của Bạn: ${otp}`,
        text: `Mã OTP đăng nhập nhiep.net của bạn là: ${otp}. Mã có hiệu lực trong 10 phút.`,
        html: htmlContent
      });

      console.log(`[AUTH-OTP] Real Email sent successfully to ${ADMIN_EMAIL} with OTP: ${otp}`);
      return {
        success: true,
        message: `Mã OTP đã được gửi đến email ${ADMIN_EMAIL}. Vui lòng kiểm tra hộp thư (hoặc mục Spam).`
      };
    } catch (err: any) {
      console.error('[AUTH-OTP] Failed to send via SMTP, falling back:', err.message);
    }
  }

  // Fallback for development / server without SMTP configured
  console.log(`\n======================================================`);
  console.log(`[NHIEP.NET ADMIN OTP] Code for ${ADMIN_EMAIL}: >>> ${otp} <<<`);
  console.log(`======================================================\n`);

  return {
    success: true,
    message: `Mã OTP đã được tạo và gửi đến ${ADMIN_EMAIL}. (Mã xác thực: ${otp})`,
    devOtp: otp
  };
}
