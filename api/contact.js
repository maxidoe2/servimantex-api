const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // Configuración de encabezados CORS para permitir peticiones desde Firebase o localhost
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Manejo de la petición preflight de CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { name, company, service, message } = req.body;

      // Validación de campos obligatorios
      if (!name || !company || !message) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
      }

      // Configuración del transporte usando Puerto 465 y SSL Directo (Recomendado por Zoho)
      const transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 465,
        secure: true, // true para usar SSL directo en puerto 465
        auth: {
          user: process.env.EMAIL_USER, 
          pass: process.env.EMAIL_PASS,
        tls: {
          // Ayuda a evitar errores de certificado en entornos serverless
          rejectUnauthorized: false
        },
      });

      // Envío del correo electrónico
      await transporter.sendMail({
        from: `"Web Servimantex" <${process.env.EMAIL_USER}>`,
        to: 'admin@servimantex.com',
        subject: `Nueva Consulta: ${service} de ${company}`,
        html: `
          <h3>Nuevo requerimiento de contacto</h3>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Empresa:</strong> ${company}</p>
          <p><strong>Servicio:</strong> ${service}</p>
          <p><strong>Mensaje:</strong> ${message}</p>
        `,
      });

      return res.status(200).json({ status: 'OK' });

    } catch (error) {
      // Log detallado en la consola de Vercel para diagnóstico
      console.error('SERVER_ERROR:', error.message);
      return res.status(500).json({ 
        status: 'Error', 
        error: 'Fallo en el envío',
        detail: error.message 
      });
    }
  }

  // Manejo de métodos no permitidos
  return res.status(405).json({ message: 'Método no permitido' });
}