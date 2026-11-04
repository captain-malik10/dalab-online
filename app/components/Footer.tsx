// import wordMark from "~/assets/images/word-mark.png";
import logo from '~/assets/images/logo.png';

function Footer() {
  return (
    <footer className="bg-[var(--color-light)] text-[var(--color-dark)]">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <img src={logo} alt="Ashal" className="h-10 mb-4" />
            <p className="text-[var(--color-muted)]">Brief description of the marketplace.</p>
          </div>
          <div>
            <h3 className="font-bold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/categories"
                  className="text-[var(--color-muted)] hover:text-[var(--color-primary)]"
                >
                  Categories
                </a>
              </li>
              <li>
                <a
                  href="/products"
                  className="text-[var(--color-muted)] hover:text-[var(--color-primary)]"
                >
                  All articles
                </a>
              </li>
              <li>
                <a
                  href="/promotions"
                  className="text-[var(--color-muted)] hover:text-[var(--color-primary)]"
                >
                  Promotions
                </a>
              </li>
              <li>
                <a
                  href="/deals"
                  className="text-[var(--color-muted)] hover:text-[var(--color-primary)]"
                >
                  Today's deals
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">About</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/about"
                  className="text-[var(--color-muted)] hover:text-[var(--color-primary)]"
                >
                  About us
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="text-[var(--color-muted)] hover:text-[var(--color-primary)]"
                >
                  Terms of service
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="text-[var(--color-muted)] hover:text-[var(--color-primary)]"
                >
                  Data protection
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Help</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/sell"
                  className="text-[var(--color-muted)] hover:text-[var(--color-primary)]"
                >
                  How to sell on Ashal
                </a>
              </li>
              <li>
                <a
                  href="/seller-help"
                  className="text-[var(--color-muted)] hover:text-[var(--color-primary)]"
                >
                  Seller help
                </a>
              </li>
              <li>
                <a
                  href="/help"
                  className="text-[var(--color-muted)] hover:text-[var(--color-primary)]"
                >
                  General help
                </a>
              </li>
              <li>
                <a
                  href="/stores"
                  className="text-[var(--color-muted)] hover:text-[var(--color-primary)]"
                >
                  List of stores
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--color-border)]">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <p className="text-[var(--color-muted)] text-sm">
            © {new Date().getFullYear()} - All rights reserved - developed by deero enterprise
          </p>
          <div className="flex items-center space-x-4">
            <span className="text-[var(--color-muted)]">EVC plus</span>
            <span className="text-[var(--color-muted)]">Edahab</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
