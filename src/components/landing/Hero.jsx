import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Globe } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9Iiw4ODhBQjkiIGZpbGwtb3BhY2l0eT0iMC4yIj48cGF0aCBkPSJNMjEgMTNjMC0yLjc2MS0yLjIzOS01LTUtNXMtNSAyLjIzOS01IDUgMi4yMzkgNSA1IDUgNS0yLjIzOSA1LTV6Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>
      </div>
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative z-10"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
                Decentralized
              </span>
              <span className="block text-gray-800 mt-2">Fundraising Made Simple</span>
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full mb-8"></div>
          
            <motion.p 
              className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Empower your community, raise funds securely, and bring your ideas to life with Fundloom's decentralized platform. No middlemen, just direct support.
            </motion.p>
          
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link
                to="/app/create-campaign"
                className="group relative inline-flex items-center justify-center px-8 py-3.5 overflow-hidden text-lg font-medium text-white rounded-lg bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <span className="relative">Start a Campaign</span>
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/app/campaigns"
                className="inline-flex items-center justify-center px-8 py-3.5 text-lg font-medium text-indigo-700 bg-white border-2 border-indigo-100 rounded-lg hover:bg-indigo-50 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <Globe className="mr-2 h-5 w-5" />
                <span>Explore Campaigns</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
        
        <motion.div 
          className="relative z-10 mt-16 sm:mt-24"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-6xl mx-auto border border-gray-100">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-50 opacity-50"></div>
            <div className="relative p-1">
              <div className="flex space-x-2 p-3 bg-gray-100 rounded-t-xl">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="bg-white p-6 rounded-b-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-gray-100">
                      <div className="h-4 bg-indigo-100 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                      <div className="h-2 bg-gray-100 rounded w-5/6 mb-1"></div>
                      <div className="h-2 bg-gray-100 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex justify-center">
                  <div className="relative
                    before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent
                    before:animate-[shimmer_2s_infinite] before:rounded-xl
                    overflow-hidden rounded-xl bg-white/50 p-0.5"
                  >
                    <div className="h-64 w-full bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center">
                      <Zap className="h-12 w-12 text-indigo-400 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating elements */}
          <motion.div 
            className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"
            animate={{
              y: [0, -20, 0],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
          <motion.div 
            className="absolute -top-10 -right-10 w-60 h-60 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"
            animate={{
              y: [0, 20, 0],
              x: [0, -20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: 1
            }}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
