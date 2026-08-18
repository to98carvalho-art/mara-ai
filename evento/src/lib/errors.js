/* Códigos de erro que o motor devolve. A interface traduz-os em texto. */
export const ERR = {
  NOT_AUTHENTICATED: 'NOT_AUTHENTICATED',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  NO_SIGNUP_NEEDED:  'NO_SIGNUP_NEEDED',   // atividade de entrada livre
  ALREADY_ENROLLED:  'ALREADY_ENROLLED',
  NOT_ENROLLED:      'NOT_ENROLLED',
  FULL:              'FULL',               // sem vagas e sem lista de espera
  ALREADY_STARTED:   'ALREADY_STARTED',
  TIME_CONFLICT:     'TIME_CONFLICT',      // já tem outra atividade à mesma hora
  LIMIT_REACHED:     'LIMIT_REACHED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_IN_USE:      'EMAIL_IN_USE',
  WEAK_PASSWORD:     'WEAK_PASSWORD',
  FORBIDDEN:         'FORBIDDEN',
  UNKNOWN:           'UNKNOWN',
}

export class AppError extends Error {
  constructor(code, details = {}) {
    super(code)
    this.code = code
    this.details = details
  }
}

export const MESSAGES = {
  [ERR.NOT_AUTHENTICATED]:  'Precisas de entrar na tua conta para te inscreveres.',
  [ERR.SESSION_NOT_FOUND]:  'Não encontrámos essa atividade.',
  [ERR.NO_SIGNUP_NEEDED]:   'Esta atividade é de entrada livre — não precisas de te inscrever.',
  [ERR.ALREADY_ENROLLED]:   'Já estás inscrito nesta atividade.',
  [ERR.NOT_ENROLLED]:       'Não estás inscrito nesta atividade.',
  [ERR.FULL]:               'Esta atividade já não tem vagas.',
  [ERR.ALREADY_STARTED]:    'Esta atividade já começou — as inscrições fecharam.',
  [ERR.TIME_CONFLICT]:      'Já tens outra atividade a esta hora.',
  [ERR.LIMIT_REACHED]:      'Atingiste o número máximo de inscrições.',
  [ERR.INVALID_CREDENTIALS]:'Email ou palavra-passe incorretos.',
  [ERR.EMAIL_IN_USE]:       'Já existe uma conta com este email.',
  [ERR.WEAK_PASSWORD]:      'A palavra-passe precisa de pelo menos 6 caracteres.',
  [ERR.FORBIDDEN]:          'Não tens permissão para fazer isto.',
  [ERR.UNKNOWN]:            'Algo correu mal. Tenta outra vez.',
}

export function messageFor(err) {
  const code = err?.code || ERR.UNKNOWN
  return MESSAGES[code] || MESSAGES[ERR.UNKNOWN]
}
