import { type PageObjectManager, type Customer } from '../pages';

/** Action métier : traverse 4 pages. Suppose l'utilisateur déjà connecté et sur le catalogue. */
export class OrderFlow {
  constructor(private readonly pages: PageObjectManager) {}

  async placeOrder(product: string, customer: Customer) {
    await this.pages.inventory.addToCart(product);
    await this.pages.inventory.header.openCart();
    await this.pages.cart.checkout();
    await this.pages.checkoutInfo.fillAndContinue(customer);
    await this.pages.overview.finish();
  }
}
