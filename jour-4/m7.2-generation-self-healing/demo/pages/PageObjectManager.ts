import { type Page } from '@playwright/test';
import { LoginPage } from './LoginPage';
import { InventoryPage } from './InventoryPage';
import { CartPage } from './CartPage';
import { CheckoutInfoPage } from './CheckoutInfoPage';
import { OverviewPage } from './OverviewPage';
import { ConfirmationPage } from './ConfirmationPage';

/** Construit chaque Page Object à la première demande, puis le réutilise. */
export class PageObjectManager {
  private _login?: LoginPage;
  private _inventory?: InventoryPage;
  private _cart?: CartPage;
  private _checkoutInfo?: CheckoutInfoPage;
  private _overview?: OverviewPage;
  private _confirmation?: ConfirmationPage;

  constructor(readonly page: Page) {}

  get login() { return (this._login ??= new LoginPage(this.page)); }
  get inventory() { return (this._inventory ??= new InventoryPage(this.page)); }
  get cart() { return (this._cart ??= new CartPage(this.page)); }
  get checkoutInfo() { return (this._checkoutInfo ??= new CheckoutInfoPage(this.page)); }
  get overview() { return (this._overview ??= new OverviewPage(this.page)); }
  get confirmation() { return (this._confirmation ??= new ConfirmationPage(this.page)); }
}
