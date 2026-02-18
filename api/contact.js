const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // 1. Manejo de CORS (Para que Firebase pueda hablar con Vercel)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://servimantex.com'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const { name, company, service, message } = req.body;

    // 2. Configuración de Zoho (SMTP)
    const transporter = nodemailer.createTransport({
      host: 'smtppro.zoho.com',
      port: 465,
      secure: true, // true para puerto 465
      auth: {
        user: process.env.EMAIL_USER, // Tu correo admin@servimantex.com
        pass: process.env.EMAIL_PASS, // Tu App Password de Zoho
      },
    });

    try {
      await transporter.sendMail({
        from: `"Web Servimantex" <${process.env.EMAIL_USER}>`,
        to: 'admin@servimantex.com',
        subject: `Nueva Consulta: ${service} de ${company}`,
        html: `
          <div style="font-family: sans-serif; border: 1px solid #eee; padding: 20px;">
            <h2 style="color: #0891b2;">Nuevo Cliente Potencial</h2>
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Empresa:</strong> ${company}</p>
            <p><strong>Servicio:</strong> ${service}</p>
            <p><strong>Mensaje:</strong></p>
            <p style="background: #f9f9f9; padding: 10px;">${message}</p>
          </div>
        `,
      });

      return res.status(200).json({ status: 'OK', message: 'Email enviado exitosamente' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: 'Error', error: error.message });
    }
  }

  return res.status(405).json({ message: 'Método no permitido' });
}