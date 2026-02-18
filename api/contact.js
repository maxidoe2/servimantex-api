const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
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
    try {
      const { name, company, service, message } = req.body;

      if (!name || !company || !message) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
      }

      const transporter = nodemailer.createTransport({
        host: 'smtppro.zoho.com',
        port: 587,
        secure: false, 
        auth: {
          user: process.env.EMAIL_USER, // xD
          pass: process.env.EMAIL_PASS, 
        },
        tls: {
          rejectUnauthorized: false,
          minVersion: 'TLSv1.2'
        },
      });

      await transporter.sendMail({
        from: `"Web Servimantex" <${process.env.EMAIL_USER}>`,
        to: 'admin@servimantex.com',
        subject: `Nueva Consulta: ${service} de ${company}`,
        html: `<h3>Nuevo requerimiento</h3><p><strong>De:</strong> ${name}</p><p><strong>Empresa:</strong> ${company}</p><p><strong>Mensaje:</strong> ${message}</p>`,
      });

      return res.status(200).json({ status: 'OK' });

    } catch (error) {
      console.error('SERVER_ERROR:', error.message);
      return res.status(500).json({ status: 'Error', error: 'Fallo en el envío' });
    }
  }

  return res.status(405).json({ message: 'Método no permitido' });
}