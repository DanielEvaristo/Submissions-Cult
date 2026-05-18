import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Genera una contraseña temporal legible de 10 caracteres */
function generateTempPassword(): string {
  const adjectives = ["Cult", "Dark", "Neon", "Wave", "Echo", "Sonic", "Noir", "Volt"];
  const numbers = Math.floor(1000 + Math.random() * 9000);
  const symbols = ["#", "!", "@", "*"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const sym = symbols[Math.floor(Math.random() * symbols.length)];
  return `${adj}${sym}${numbers}`;
}

// ─── GET — Lista cuentas PENDING_CLAIM ────────────────────────────────────────

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const search = searchParams.get("search") || "";
  const skip = (page - 1) * limit;

  const whereClause: any = { accountStatus: "PENDING_CLAIM" };
  if (search) {
    whereClause.email = { contains: search, mode: "insensitive" };
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        name: true,
        artistName: true,
        country: true,
        city: true,
        genre: true,
        createdAt: true,
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where: whereClause }),
  ]);

  return NextResponse.json({ users, total, page, limit });
}

// ─── POST — Aprobar cuenta y (opcionalmente) enviar contraseña temporal ───────

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { userId, action } = body;

  if (!userId || !action) {
    return NextResponse.json({ error: "Missing userId or action" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, accountStatus: true, artistName: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.accountStatus !== "PENDING_CLAIM") {
    return NextResponse.json({ error: "Account is not in PENDING_CLAIM state" }, { status: 400 });
  }

  // ── Acción: APPROVE — activa la cuenta con contraseña temporal ────────────
  if (action === "APPROVE") {
    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: "ACTIVE",
        password: hashedPassword,
        emailVerified: new Date(),
      },
    });

    // ── Envío de correo con Resend ─────────────────────────────────────────
    const resend = new Resend(process.env.RESEND_API_KEY);
    const loginUrl = `${process.env.NEXTAUTH_URL}/en/login`;
    const displayName = user.artistName || user.name || "artista";

    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "Cult Machine <onboarding@resend.dev>",
        to: user.email,
        subject: "Tu cuenta de Cult Machine está lista 🎵",
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"></head>
          <body style="margin:0;padding:0;background:#0A0A0A;font-family:monospace;">
            <div style="max-width:560px;margin:0 auto;padding:48px 32px;">
              <div style="border-bottom:4px solid #F5E000;padding-bottom:24px;margin-bottom:32px;">
                <span style="color:#F5E000;font-size:28px;font-weight:900;text-transform:uppercase;letter-spacing:-1px;">★ CULT MACHINE</span>
              </div>
              <h1 style="color:#ffffff;font-size:36px;font-weight:900;text-transform:uppercase;letter-spacing:-1px;margin:0 0 8px 0;">
                ¡Tu cuenta<br/>está lista!
              </h1>
              <p style="color:rgba(255,255,255,0.4);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:3px;margin:0 0 40px 0;">
                ACCESO ACTIVADO — ${displayName}
              </p>
              <p style="color:rgba(255,255,255,0.7);font-size:14px;font-weight:600;margin:0 0 32px 0;line-height:1.6;">
                Hemos encontrado tus submissions anteriores y activado tu cuenta. Usa la contraseña temporal a continuación para iniciar sesión.
              </p>
              <div style="background:#111;border:4px solid #F5E000;padding:24px 32px;margin:0 0 32px 0;">
                <p style="color:rgba(255,255,255,0.4);font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:4px;margin:0 0 8px 0;">CONTRASEÑA TEMPORAL</p>
                <p style="color:#F5E000;font-size:28px;font-weight:900;letter-spacing:4px;margin:0;">${tempPassword}</p>
              </div>
              <p style="color:rgba(255,255,255,0.4);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin:0 0 32px 0;">
                ⚠ Cambia tu contraseña después de iniciar sesión por primera vez.
              </p>
              <a href="${loginUrl}" style="display:inline-block;background:#F5E000;color:#000000;font-weight:900;font-size:12px;text-transform:uppercase;letter-spacing:3px;padding:16px 32px;text-decoration:none;">
                INICIAR SESIÓN →
              </a>
              <div style="border-top:2px solid rgba(255,255,255,0.05);padding-top:32px;margin-top:48px;">
                <p style="color:rgba(255,255,255,0.15);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin:0;">
                  CULT MACHINE // SISTEMA DE ACCESO // NO RESPONDAS ESTE CORREO
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      console.log(`[ADMIN] Email sent to: ${user.email}`);
    } catch (emailErr) {
      // No bloqueamos la aprobación si el email falla — logueamos el error
      console.error("[ADMIN] Failed to send email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Account approved",
      tempPassword, // Devolvemos la contraseña temporal para que el admin la vea en la UI
      email: user.email,
    });
  }

  // ── Acción: REJECT — elimina la cuenta importada ──────────────────────────
  if (action === "REJECT") {
    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true, message: "Account rejected and removed" });
  }

  return NextResponse.json({ error: "Invalid action. Use APPROVE or REJECT" }, { status: 400 });
}
