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

export default function STerms() {
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
        <span style={{ fontSize: 15, fontWeight: 700, color: X.text }}>Termos e Condições</span>
      </div>

      {/* content */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>
        <p style={{ fontSize: 13, color: X.textMute, marginBottom: 40 }}>
          Última atualização: maio de 2025 · Polido e Carvalho Lda · NIF 515589128
        </p>

        <Section title="1. O serviço">
          <p>
            A <strong style={{ color: X.text }}>Mara AI</strong> é uma plataforma de mediação assistida por inteligência artificial que analisa conflitos relacionais com base nos relatos de ambas as partes e gera um relatório com veredicto, análise psicológica e plano de resolução.
          </p>
          <p style={{ marginTop: 10 }}>
            O serviço é operado pela <strong style={{ color: X.text }}>Polido e Carvalho Lda</strong>, NIF 515 589 128.
          </p>
        </Section>

        <Section title="2. Aceitação dos termos">
          <p>
            Ao utilizar a Mara AI, declara ter lido, compreendido e aceite estes Termos e Condições, bem como a nossa <span onClick={() => nav('/privacy')} style={{ color: X.acc1, cursor: 'pointer' }}>Política de Privacidade</span>. Se não concordar, não deve utilizar o serviço.
          </p>
        </Section>

        <Section title="3. Idade mínima">
          <p>
            O serviço destina-se exclusivamente a maiores de <strong style={{ color: X.text }}>18 anos</strong>. Ao utilizar a Mara AI, confirma que tem idade igual ou superior a 18 anos.
          </p>
        </Section>

        <Section title="4. Natureza do serviço — não é terapia">
          <p style={{ color: '#FF4B6E', fontWeight: 600, marginBottom: 8 }}>⚠️ Aviso importante</p>
          <p>
            A Mara AI é uma ferramenta de apoio à reflexão e mediação, <strong style={{ color: X.text }}>não substitui acompanhamento psicológico ou psiquiátrico profissional</strong>. Os relatórios gerados são produzidos por inteligência artificial e não constituem diagnóstico clínico, aconselhamento jurídico ou terapia.
          </p>
          <p style={{ marginTop: 10 }}>
            Em situações de crise, violência doméstica ou saúde mental em risco, contacte os serviços de emergência (112) ou uma linha de apoio especializada.
          </p>
        </Section>

        <Section title="5. Preço e pagamento">
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <Li>O relatório completo tem o preço de <strong style={{ color: X.text }}>R$ 9,99</strong> por sessão, pagamento único.</Li>
            <Li>São aceites: cartão de crédito/débito, Pix e Apple Pay.</Li>
            <Li>O pagamento é processado de forma segura pela <strong style={{ color: X.text }}>Stripe</strong>.</Li>
            <Li>Os preços podem ser alterados com aviso prévio de 30 dias.</Li>
          </ul>
        </Section>

        <Section title="6. Política de reembolso">
          <p>
            Dado que o relatório é gerado e entregue imediatamente após o pagamento, <strong style={{ color: X.text }}>não são concedidos reembolsos</strong> após a entrega do relatório, nos termos do artigo 59.º, alínea a), do Decreto-Lei n.º 24/2014 (direito de arrependimento não aplicável a conteúdo digital entregue imediatamente).
          </p>
          <p style={{ marginTop: 10 }}>
            Em caso de falha técnica que impeça a entrega do relatório, o reembolso integral será efetuado no prazo de 5 dias úteis. Contacte-nos em <a href="mailto:antonio@sweetlabgroup.com" style={{ color: X.acc1, textDecoration: 'none' }}>antonio@sweetlabgroup.com</a>.
          </p>
        </Section>

        <Section title="7. Conteúdo do utilizador">
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <Li>É responsável pelo conteúdo que partilha com a Mara AI.</Li>
            <Li>Não deve partilhar informações de terceiros sem o seu consentimento.</Li>
            <Li>É proibido utilizar o serviço para fins ilegais, difamatórios ou que violem direitos de terceiros.</Li>
            <Li>Ao submeter conteúdo, autoriza o seu processamento para os fins descritos na Política de Privacidade.</Li>
          </ul>
        </Section>

        <Section title="8. Limitação de responsabilidade">
          <p>
            Na máxima extensão permitida pela lei aplicável, a Polido e Carvalho Lda não é responsável por:
          </p>
          <ul style={{ paddingLeft: 20, margin: '8px 0 0' }}>
            <Li>Decisões tomadas com base nos relatórios gerados pela Mara AI.</Li>
            <Li>Danos indiretos, incidentais ou consequenciais decorrentes do uso do serviço.</Li>
            <Li>Indisponibilidade temporária do serviço por motivos técnicos.</Li>
            <Li>Imprecisões nos relatórios gerados por inteligência artificial.</Li>
          </ul>
          <p style={{ marginTop: 12 }}>
            A responsabilidade total máxima da Polido e Carvalho Lda perante o utilizador fica limitada ao valor pago pelo serviço.
          </p>
        </Section>

        <Section title="9. Propriedade intelectual">
          <p>
            A marca Mara AI, o logótipo, o design e o software da plataforma são propriedade exclusiva da Polido e Carvalho Lda. É proibida a reprodução, distribuição ou utilização não autorizada.
          </p>
          <p style={{ marginTop: 10 }}>
            Os relatórios gerados são disponibilizados para uso pessoal do utilizador. Não é permitida a reprodução comercial sem autorização escrita.
          </p>
        </Section>

        <Section title="10. Suspensão e encerramento">
          <p>
            Reservamo-nos o direito de suspender ou encerrar o acesso ao serviço em caso de violação destes Termos, sem aviso prévio e sem direito a reembolso.
          </p>
        </Section>

        <Section title="11. Alterações aos termos">
          <p>
            Podemos atualizar estes Termos periodicamente. Alterações materiais serão comunicadas com pelo menos 15 dias de antecedência. A continuação do uso do serviço após a entrada em vigor das alterações constitui aceitação dos novos Termos.
          </p>
        </Section>

        <Section title="12. Lei aplicável e foro">
          <p>
            Estes Termos são regidos pela lei portuguesa. Para resolução de litígios de consumo, o utilizador pode recorrer ao Centro de Arbitragem de Conflitos de Consumo em <a href="https://www.consumidor.gov.pt" target="_blank" rel="noopener noreferrer" style={{ color: X.acc1, textDecoration: 'none' }}>consumidor.gov.pt</a>. Para utilizadores no Brasil, aplica-se o Código de Defesa do Consumidor (Lei 8.078/90).
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
