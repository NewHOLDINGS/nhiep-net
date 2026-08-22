import { NextRequest, NextResponse } from 'next/server';
import { createAdminOtp, verifyAdminOtp } from '@/lib/storage';
import { sendAdminOtpEmail } from '@/lib/email';

const ADMIN_EMAIL = 'newholding.net@gmail.com';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, otp } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp địa chỉ email quản trị viên.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. ACTION: REQUEST OTP
    if (action === 'send_otp') {
      if (cleanEmail !== ADMIN_EMAIL) {
        return NextResponse.json(
          {
            success: false,
            error: `Quyền truy cập bị từ chối. Chỉ tài khoản ${ADMIN_EMAIL} được phép đăng nhập hệ thống quản trị.`
          },
          { status: 403 }
        );
      }

      const otpResult = createAdminOtp(cleanEmail);
      if (!otpResult.success || !otpResult.otp) {
        return NextResponse.json({ success: false, error: otpResult.message }, { status: 500 });
      }

      // Send email via nodemailer / fallback
      const emailResult = await sendAdminOtpEmail(cleanEmail, otpResult.otp);

      return NextResponse.json({
        success: true,
        message: emailResult.message,
        expiresAt: otpResult.expiresAt,
        devOtp: emailResult.devOtp // In dev mode, allows seamless verification if SMTP is not active
      });
    }

    // 2. ACTION: VERIFY OTP
    if (action === 'verify_otp') {
      if (!otp) {
        return NextResponse.json(
          { success: false, error: 'Vui lòng nhập mã OTP 6 số đã được gửi vào email.' },
          { status: 400 }
        );
      }

      const verifyResult = verifyAdminOtp(cleanEmail, otp);
      if (!verifyResult.success) {
        return NextResponse.json(
          { success: false, error: verifyResult.message },
          { status: 401 }
        );
      }

      // Set cookie or return token
      const response = NextResponse.json({
        success: true,
        message: verifyResult.message,
        token: verifyResult.token,
        adminEmail: cleanEmail
      });

      // Set secure HTTP-only admin cookie if needed
      response.cookies.set('nhiep_admin_token', verifyResult.token || '', {
        path: '/',
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax'
      });

      return response;
    }

    return NextResponse.json({ success: false, error: 'Hành động không hợp lệ.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('nhiep_admin_token')?.value;
    if (token && token.length >= 32) {
      return NextResponse.json({
        authenticated: true,
        adminEmail: ADMIN_EMAIL
      });
    }
    return NextResponse.json({ authenticated: false });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, error: err.message });
  }
}
