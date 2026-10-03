import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Globe, MessageCircle, Share2, ExternalLink, Mail, CreditCard } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="container mx-auto px-4 md:px-6">
        {/* Main 4-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-16">
          
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-indigo-500 text-white p-1.5 rounded-lg inline-flex">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-white">PlanCart</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
              Your one-stop destination for premium products. We bring the world&apos;s best brands to your doorstep with our AI-powered shopping experience.
            </p>
            <div className="flex gap-4">
              <SocialIcon icon={<Globe className="w-5 h-5" />} href="#" />
              <SocialIcon icon={<MessageCircle className="w-5 h-5" />} href="#" />
              <SocialIcon icon={<Share2 className="w-5 h-5" />} href="#" />
              <SocialIcon icon={<ExternalLink className="w-5 h-5" />} href="#" />
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-4 text-sm">
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/careers">Careers</FooterLink>
              <FooterLink href="/press">Press & Media</FooterLink>
              <FooterLink href="/blog">Our Blog</FooterLink>
              <FooterLink href="/stores">Store Locator</FooterLink>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Customer Service</h3>
            <ul className="space-y-4 text-sm">
              <FooterLink href="/help">Help Center</FooterLink>
              <FooterLink href="/returns">Returns & Refunds</FooterLink>
              <FooterLink href="/shipping">Shipping Info</FooterLink>
              <FooterLink href="/track">Track Order</FooterLink>
              <FooterLink href="/contact">Contact Us</FooterLink>
            </ul>
          </div>

          {/* Column 4: AI Features & Newsletter */}
          <div className="space-y-8">
            <div>
              <h3 className="text-white font-semibold text-lg mb-6">Our AI Features</h3>
              <ul className="space-y-4 text-sm">
                <FooterLink href="/ai/chat">Smart Chatbot</FooterLink>
                <FooterLink href="/ai/visualizer">Room Visualizer</FooterLink>
                <FooterLink href="/ai/voice">Voice Shopping</FooterLink>
                <FooterLink href="/ai/compare">Smart Compare</FooterLink>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-white font-medium text-sm">Subscribe to Newsletter</h4>
              <form className="flex">
                <input 
                  suppressHydrationWarning
                  type="email" 
                  placeholder="Your email address" 
                  className="bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-l-lg outline-none focus:border-indigo-500 w-full text-sm"
                />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-r-lg transition-colors flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-slate-800 mb-8"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PlanCart. All rights reserved.</p>
          
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookie Settings</Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="sr-only">Payment Methods</span>
            <div className="px-2 py-1 bg-slate-800 rounded border border-slate-700 font-medium">VISA</div>
            <div className="px-2 py-1 bg-slate-800 rounded border border-slate-700 font-medium">MC</div>
            <div className="px-2 py-1 bg-slate-800 rounded border border-slate-700 font-medium">UPI</div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ icon, href }: { icon: React.ReactNode, href: string }) {
  return (
    <a 
      href={href} 
      className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all"
    >
      {icon}
    </a>
  );
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="hover:text-indigo-400 transition-colors flex items-center gap-2 group">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-indigo-500 transition-colors"></span>
        {children}
      </Link>
    </li>
  );
}
