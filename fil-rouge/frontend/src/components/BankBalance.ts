/**
 * <bank-balance> : Web Component avec Shadow DOM ouvert.
 * Simule un widget partagé entre plusieurs applications de la banque.
 * Attributs : label, amount (nombre), currency.
 */
class BankBalance extends HTMLElement {
  static get observedAttributes() {
    return ['label', 'amount', 'currency'];
  }

  private root: ShadowRoot;

  constructor() {
    super();
    this.root = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  private render() {
    const label = this.getAttribute('label') ?? 'Solde';
    const amount = Number(this.getAttribute('amount') ?? 0);
    const currency = this.getAttribute('currency') ?? 'EUR';
    const formatted = new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);
    this.root.innerHTML = `
      <style>
        .box { border-left: 4px solid #1e3a8a; padding: 8px 12px; background: #eef2ff; border-radius: 4px; }
        .label { font-size: 12px; color: #4b5563; text-transform: uppercase; letter-spacing: .05em; }
        .amount { font-size: 22px; font-weight: 600; color: ${amount < 0 ? '#991b1b' : '#1f2937'}; }
      </style>
      <div class="box" role="group" aria-label="${label}">
        <div class="label">${label}</div>
        <div class="amount">${formatted}</div>
      </div>`;
  }
}

if (!customElements.get('bank-balance')) {
  customElements.define('bank-balance', BankBalance);
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'bank-balance': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        label?: string;
        amount?: number | string;
        currency?: string;
      };
    }
  }
}

export {};
