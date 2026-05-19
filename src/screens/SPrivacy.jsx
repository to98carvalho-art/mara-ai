import { useNavigate } from 'react-router-dom'
import { X, FUI, FED } from '../design/tokens'

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{ fontFamily: FED, fontWeight: 400, fontSize: 22, letterSpacing: -0.6, color: X.text, marginBottom: 12, marginTop: 0 }}>
        {title}
      </h2>
      <div style={{ fontSize: 14.5, color: X.textSoft, lineHeight: 1.75 }}>
        {children}
      </div>
    </div>
  )
}

function Li({ children }) {
  return <li style={{ marginBottom: 6 }}>{children}</li>
}

export default function SPrivacy() {
  const nav = useNavigate()

  return (
    <div style={{ background: X.ink, minHeight: '100%', fontFamily: FUI, color: X.text }}>
      {/* header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: `${X.ink}ee`, backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${X.line}`,
        padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <button onClick={() => nav(-1)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: X.textSoft, fontSize: 13, fontFamily: FUI, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 6, padding: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Voltar
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: X.text }}>Política de Privacidade</span>
      </div>

      {/* content */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>
        <p style={{ fontSize: 13, color: X.textMute, marginBottom: 40 }}>
          Última atualização: maio de 2025 · Polido e Carvalho Lda · NIF 515589128
        </p>

        <Section title="1. Quem somos">
          <p>
            A <strong style={{ color: X.text }}>Mara AI</strong> é um serviço operado pela <strong style={{ color: X.text }}>Polido e Carvalho Lda</strong>, com NIF 515 589 128, responsável pelo tratamento dos seus dados pessoais.
          </p>
          <p style={{ marginTop: 10 }}>
            Contacto do Encarregado de Proteção de Dados:<br/>
            📧 <a href="mailto:antonio@sweetlabgroup.com" style={{ color: X.acc1, textDecoration: 'none' }}>antonio@sweetlabgroup.com</a><br/>
            📞 +351 911 549 384
          </p>
        </Section>

        <Section title="2. Que dados recolhemos">
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <Li><strong style={{ color: X.text }}>Conteúdo da conversa</strong> — o relato do conflito que partilha com a Mara (dados potencialmente sensíveis de natureza relacional e psicológica).</Li>
            <Li><strong style={{ color: X.text }}>Número de WhatsApp</strong> — apenas quando opta por convidar a outra parte, para envio do convite.</Li>
            <Li><strong style={{ color: X.text }}>Dados de pagamento</strong> — processados diretamente pela Stripe; não armazenamos números de cartão ou dados bancários.</Li>
            <Li><strong style={{ color: X.text }}>Dados de sessão</strong> — um código de 4 caracteres temporário que associa os dois lados de uma conversa.</Li>
            <Li><strong style={{ color: X.text }}>Dados de análise</strong> — visitas anónimas ao site (Google Analytics), apenas com o seu consentimento.</Li>
            <Li><strong style={{ color: X.text }}>Dados técnicos</strong> — endereço IP e informações de browser, recolhidos automaticamente pela infraestrutura de alojamento (Vercel).</Li>
          </ul>
        </Section>

        <Section title="3. Para que usamos os seus dados">
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <Li>Gerar o relatório de mediação com recurso a inteligência artificial (OpenAI).</Li>
            <Li>Enviar o convite à outra parte via WhatsApp (Z-API), quando solicitado.</Li>
            <Li>Processar o pagamento do relatório (Stripe).</Li>
            <Li>Melhorar o serviço com base em métricas de utilização anónimas.</Li>
            <Li>Cumprir obrigações legais e fiscais.</Li>
          </ul>
        </Section>

        <Section title="4. Base legal do tratamento">
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <Li><strong style={{ color: X.text }}>Execução de contrato</strong> — dados necessários para prestar o serviço contratado (relatório de mediação).</Li>
            <Li><strong style={{ color: X.text }}>Consentimento</strong> — para cookies de análise e tratamento de dados sensíveis.</Li>
            <Li><strong style={{ color: X.text }}>Obrigação legal</strong> — dados de faturação exigidos por lei.</Li>
          </ul>
        </Section>

        <Section title="5. Com quem partilhamos os seus dados">
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <Li><strong style={{ color: X.text }}>OpenAI (EUA)</strong> — processamento das conversas para geração do relatório por IA. <a href="https://openai.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: X.acc1, textDecoration: 'none' }}>Política OpenAI →</a></Li>
            <Li><strong style={{ color: X.text }}>Stripe (EUA)</strong> — processamento de pagamentos. <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: X.acc1, textDecoration: 'none' }}>Política Stripe →</a></Li>
            <Li><strong style={{ color: X.text }}>Z-API (Brasil)</strong> — envio de mensagens WhatsApp.</Li>
            <Li><strong style={{ color: X.text }}>Upstash (EUA)</strong> — armazenamento temporário de sessões em Redis.</Li>
            <Li><strong style={{ color: X.text }}>Vercel (EUA)</strong> — alojamento da aplicação.</Li>
            <Li><strong style={{ color: X.text }}>Google Analytics (EUA)</strong> — métricas de utilização anónimas, apenas com consentimento.</Li>
          </ul>
          <p style={{ marginTop: 12 }}>
            Todas as transferências internacionais de dados para fora do Espaço Económico Europeu são feitas com base em Cláusulas Contratuais Padrão aprovadas pela Comissão Europeia.
          </p>
        </Section>

        <Section title="6. Quanto tempo guardamos os seus dados">
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <Li><strong style={{ color: X.text }}>Dados de sessão e conversa</strong> — eliminados automaticamente 7 dias após a geração do relatório.</Li>
            <Li><strong style={{ color: X.text }}>Dados de pagamento</strong> — retidos pela Stripe nos termos da sua política; dados de faturação mantidos 10 anos por obrigação legal.</Li>
            <Li><strong style={{ color: X.text }}>Dados de análise</strong> — retidos por 14 meses no Google Analytics (configuração padrão).</Li>
          </ul>
        </Section>

        <Section title="7. Os seus direitos (LGPD · RGPD)">
          <p>Tem o direito de, a qualquer momento:</p>
          <ul style={{ paddingLeft: 20, margin: '8px 0 0' }}>
            <Li><strong style={{ color: X.text }}>Aceder</strong> aos seus dados pessoais.</Li>
            <Li><strong style={{ color: X.text }}>Corrigir</strong> dados incorretos ou incompletos.</Li>
            <Li><strong style={{ color: X.text }}>Eliminar</strong> os seus dados ("direito ao esquecimento").</Li>
            <Li><strong style={{ color: X.text }}>Portabilidade</strong> — receber os seus dados em formato estruturado.</Li>
            <Li><strong style={{ color: X.text }}>Opor-se</strong> ao tratamento para fins de marketing ou análise.</Li>
            <Li><strong style={{ color: X.text }}>Retirar o consentimento</strong> a qualquer momento, sem prejuízo do tratamento já realizado.</Li>
          </ul>
          <p style={{ marginTop: 12 }}>
            Para exercer qualquer destes direitos, contacte-nos em <a href="mailto:antonio@sweetlabgroup.com" style={{ color: X.acc1, textDecoration: 'none' }}>antonio@sweetlabgroup.com</a>. Respondemos no prazo máximo de 30 dias.
          </p>
          <p style={{ marginTop: 10 }}>
            Tem também o direito de apresentar reclamação à <strong style={{ color: X.text }}>CNPD</strong> (Portugal) em <a href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer" style={{ color: X.acc1, textDecoration: 'none' }}>cnpd.pt</a> ou à <strong style={{ color: X.text }}>ANPD</strong> (Brasil) em <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" style={{ color: X.acc1, textDecoration: 'none' }}>gov.br/anpd</a>.
          </p>
        </Section>

        <Section title="8. Cookies">
          <p>
            Utilizamos apenas cookies estritamente necessários para o funcionamento da sessão. Cookies de análise (Google Analytics) são utilizados somente após o seu consentimento explícito, que pode retirar a qualquer momento através do banner de cookies ou contactando-nos.
          </p>
        </Section>

        <Section title="9. Segurança">
          <p>
            Os dados em trânsito são protegidos por TLS/HTTPS. O acesso aos sistemas é restrito e os dados de sessão são armazenados de forma encriptada. Contudo, nenhum sistema é 100% seguro — em caso de incidente de segurança que afete os seus dados, seremos notificados no prazo legal.
          </p>
        </Section>

        <Section title="10. Alterações a esta política">
          <p>
            Podemos atualizar esta política periodicamente. Alterações materiais serão comunicadas através de aviso na aplicação. A data de "última atualização" no topo do documento indica sempre a versão em vigor.
          </p>
        </Section>

        <div style={{
          marginTop: 40, padding: '20px 24px', borderRadius: 16,
          background: 'rgba(255,255,255,0.02)', border: `1px solid ${X.line}`,
          fontSize: 13, color: X.textMute, lineHeight: 1.6,
        }}>
          <strong style={{ color: X.textSoft }}>Polido e Carvalho Lda</strong><br/>
          NIF 515 589 128<br/>
          📧 antonio@sweetlabgroup.com<br/>
          📞 +351 911 549 384
        </div>
      </div>
    </div>
  )
}
