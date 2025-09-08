import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Twitter, Github, Mail, Zap } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const navigation = {
    main: [
      { name: 'About', href: '/about' },
      { name: 'Campaigns', href: '/app/campaigns' },
      { name: 'Create', href: '/app/create-campaign' },
      { name: 'How It Works', href: '/how-it-works' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Contact', href: '/contact' },
      { name: 'Privacy', href: '/privacy' },
      { name: 'Terms', href: '/terms' },
    ],
    social: [
      {
        name: 'Twitter',
        href: 'https://twitter.com/fundloom',
        icon: Twitter,
        color: 'hover:text-blue-400',
      },
      {
        name: 'GitHub',
        href: 'https://github.com/fundloom',
        icon: Github,
        color: 'hover:text-gray-700',
      },
      {
        name: 'Email',
        href: 'mailto:hello@fundloom.xyz',
        icon: Mail,
        color: 'hover:text-red-400',
      },
    ],
  };
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <footer className="relative bg-gradient-to-b from-gray-50 to-white border-t border-gray-100 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-64 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Zap className="h-8 w-8 text-indigo-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
              Fundloom
            </span>
          </div>
          <p className="max-w-2xl mx-auto text-gray-600">
            The decentralized fundraising platform that puts creators first. Built on blockchain for transparency and trust.
          </p>
        </motion.div>
        
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-center py-8 border-t border-gray-100"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <motion.nav 
            className="flex flex-wrap justify-center -mx-3 -my-1 mb-6 md:mb-0"
            variants={item}
            aria-label="Footer navigation"
          >
            {navigation.main.map((item) => (
              <motion.div 
                key={item.name} 
                className="px-3 py-1"
                variants={item}
              >
                <Link 
                  to={item.href}
                  className="text-gray-500 hover:text-indigo-600 transition-colors font-medium text-sm"
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}
          </motion.nav>
          
          <motion.div 
            className="flex space-x-6"
            variants={item}
          >
            {navigation.social.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`text-gray-400 ${item.color} transition-colors`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.name}
                >
                  <span className="sr-only">{item.name}</span>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </a>
              );
            })}
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="pt-8 border-t border-gray-100 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-sm text-gray-500">
            &copy; {currentYear} Fundloom Technologies, Inc. All rights reserved.
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Built with ❤️ for the decentralized future.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
