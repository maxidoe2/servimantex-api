const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // 1. Manejo de CORS (Permite que tu web en Firebase se comunique con Vercel)
  res.setHeader('Access-Control-Allow-Credentials', true);
  // Mientras terminas de configurar el SSL, puedes usar '*' si tienes problemas, 
  // pero lo ideal es dejarlo en tu dominio final:
  res.setHeader('Access-Control-Allow-Origin', 'https://servimantex.com'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Responder a la petición pre-flight de CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const { name, company, service, message } = req.body;

    // 2. Configuración de Zoho (Optimizado para usuarios de organización)
    const transporter = nodemailer.createTransport({
      host: 'smtppro.zoho.com',
      port: 587, // Cambiado a 587 para evitar bloqueos SSL directos
      secure: false, // false para STARTTLS en puerto 587
      auth: {
        user: process.env.EMAIL_USER, // admin@servimantex.com
        pass: process.env.EMAIL_PASS, // Tu App Password: XfgDADVyHZf2
      },
      tls: {
        // Forza el uso de TLS y evita errores de certificados no verificados
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      }
    });

    try {
      // 3. Envío del Email
      await transporter.sendMail({
        from: `"Web Servimantex" <${process.env.EMAIL_USER}>`,
        to: 'admin@servimantex.com',
        subject: `Nueva Consulta Técnica: ${service} - ${company}`,
        html: `
          <div style="font-family: sans-serif; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; color: #1e293b;">
            <h2 style="color: #0891b2; margin-bottom: 20px; border-bottom: 2px solid #0891b2; padding-bottom: 10px;">
              Solicitud de Evaluación Técnica
            </h2>
            <p><strong>Representante:</strong> ${name}</p>
            <p><strong>Organización:</strong> ${company}</p>
            <p><strong>Área de Interés:</strong> ${service}</p>
            <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border-radius: 6px; border-left: 4px solid #0891b2;">
              <p style="margin-bottom: 5px; font-weight: bold;">Especificaciones del Proyecto:</p>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px;">
              Este mensaje fue enviado automáticamente desde el formulario B2B de servimantex.com
            </p>
          </div>
        `,
      });

      return res.status(200).json({ status: 'OK', message: 'Email enviado con éxito' });
    } catch (error) {
      console.error('Error de Nodemailer:', error);
      return res.status(500).json({ status: 'Error', error: error.message });
    }
  }

  return res.status(405).json({ message: 'Método no permitido' });
}