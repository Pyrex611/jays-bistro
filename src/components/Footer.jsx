import React from 'react';
import { MapPin, Phone, Instagram, Twitter, Facebook } from 'lucide-react';

const Footer = ({ GOOGLE_MAPS_URL, WHATSAPP_NUMBER }) => {
    return (
        <footer className="pt-20 pb-10 mt-auto" style={{ backgroundColor: '#1A1A1A', color: '#F9F7F2', borderColor: '#333333' }}>
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <div className="space-y-6">
                    <h3 className="font-serif text-3xl font-bold text-accent">Jay's Bistro</h3>
                    <p className="text-sm leading-relaxed" style={{ color: '#AAAAAA' }}>Defining modern dining with a touch of traditional elegance.</p>
                    <div className="flex gap-4">
                        <div className="p-2 border border-[#333333] rounded-full hover:bg-accent hover:border-accent hover:text-black transition-colors cursor-pointer"><Instagram size={18} /></div>
                        <div className="p-2 border border-[#333333] rounded-full hover:bg-accent hover:border-accent hover:text-black transition-colors cursor-pointer"><Twitter size={18} /></div>
                        <div className="p-2 border border-[#333333] rounded-full hover:bg-accent hover:border-accent hover:text-black transition-colors cursor-pointer"><Facebook size={18} /></div>
                    </div>
                </div>
                <div>
                    <h4 className="font-serif text-white text-xl mb-6">Visit Us</h4>
                    <a href={GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 group hover:text-white transition-colors mb-4" style={{ color: '#AAAAAA' }}>
                        <MapPin size={20} className="text-accent mt-1 group-hover:scale-110 transition-transform" />
                        <span>Precious Events Centre,<br/>Makurdi, Nigeria</span>
                    </a>
                    <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group hover:text-white transition-colors" style={{ color: '#AAAAAA' }}>
                        <Phone size={20} className="text-accent group-hover:scale-110 transition-transform" />
                        <span>+234 806 262 4447</span>
                    </a>
                </div>
                <div>
                    <h4 className="font-serif text-white text-xl mb-6">Opening Hours</h4>
                    <ul className="space-y-4 text-sm" style={{ color: '#AAAAAA' }}>
                        <li className="flex justify-between border-b border-[#333333] pb-2"><span>Mon - Fri</span> <span className="text-white">08:00 - 22:00</span></li>
                        <li className="flex justify-between border-b border-[#333333] pb-2"><span>Saturday</span> <span className="text-white">09:00 - 23:00</span></li>
                        <li className="flex justify-between pb-2"><span>Sunday</span> <span className="text-white">10:00 - 22:00</span></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-serif text-white text-xl mb-6">Newsletter</h4>
                    <p className="text-sm mb-4" style={{ color: '#AAAAAA' }}>Join us for exclusive offers and updates.</p>
                    <div className="flex w-full rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-accent">
                        <input type="email" placeholder="Your email..." className="flex-1 bg-[#242424] border-none text-white px-4 py-3 text-sm outline-none" />
                        <button className="bg-accent text-[#1A1A1A] px-5 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors">Join</button>
                    </div>
                </div>
            </div>
            <div className="text-center text-xs uppercase tracking-widest pt-8 border-t" style={{ color: '#AAAAAA', borderColor: '#333333' }}>
                © {new Date().getFullYear()} Jay's Bistro. All rights reserved. Designed by Pyrexx.
            </div>
        </footer>
    );
};

export default Footer;