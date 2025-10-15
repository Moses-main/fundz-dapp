import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Globe } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/30 via-gray-900 to-gray-900">
          <div className="absolute inset-0 bg-grid-slate-800/20 [mask-image:linear-gradient(0deg,transparent,white)]"></div>
        </div>

        {/* Animated gradient blobs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 mb-6">
            <span className="flex h-2 w-2 mr-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Live on Ethereum & Startknet Sepolia
          </div>

          <motion.h1
            className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Fund Your Ideas
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
              Powered by Crypto & Community
            </span>
          </motion.h1>

          <motion.p
            className="mt-6 text-xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Launch campaigns, share across your network, and get funded globally
            with crypto or fiat.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link
              to="/create-campaign"
              className="px-8 py-4 text-base font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Start a Campaign
            </Link>
            <Link
              to="/campaigns"
              className="px-8 py-4 text-base font-medium text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl backdrop-blur-sm transition-all duration-300"
            >
              Explore Campaigns
            </Link>
          </motion.div>

          <motion.div
            className="mt-12 flex items-center justify-center space-x-6 text-sm text-gray-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="flex items-center">
              <div className="flex -space-x-2 overflow-hidden">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-gray-800 overflow-hidden"
                  >
                    <div className="h-full w-full bg-gradient-to-br from-indigo-400 to-blue-400 animate-pulse"></div>
                  </div>
                ))}
              </div>
              <span className="ml-3">Join 10,000+ creators</span>
            </div>
            <div className="h-4 w-px bg-gray-700"></div>
            <div className="flex items-center">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-400">
                <Zap className="h-4 w-4" />
              </div>
              <span className="ml-2">$50M+ raised to date</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="mt-16 sm:mt-24"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="relative max-w-5xl mx-auto bg-white/5 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-gray-900/30 opacity-90"></div>
            <div className="relative px-6 py-8 sm:p-10">
              <div className="flex items-center space-x-2 text-sm font-medium text-indigo-400 mb-6">
                <span className="px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-400/20">
                  🔥 Trending
                </span>
                <span>Featured Campaign</span>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">
                    EcoCrypto: Green Energy Initiative
                  </h3>
                  <p className="mt-2 text-gray-300">
                    Support our mission to bring renewable energy to underserved
                    communities using blockchain technology.
                  </p>
                  <div className="mt-4 flex items-center">
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-2.5 rounded-full"
                        style={{ width: "75%" }}
                      ></div>
                    </div>
                    <span className="ml-4 text-sm font-medium text-gray-300">
                      75% funded
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between text-sm text-gray-400 gap-4">
                    <span>
                      Raised:{" "}
                      <span className="font-medium text-white">$37,500</span>
                    </span>
                    <span>
                      Goal:{" "}
                      <span className="font-medium text-white">$50,000</span>
                    </span>
                    <span>
                      Backers:{" "}
                      <span className="font-medium text-white">128</span>
                    </span>
                    <span>
                      Days Left:{" "}
                      <span className="font-medium text-white">12</span>
                    </span>
                  </div>
                </div>
                <Link
                  to="/campaigns"
                  className="w-full md:w-auto px-6 py-3 text-sm font-medium text-center text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                  View Campaign
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-64 bg-gradient-to-r from-indigo-500/30 to-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl"></div>

      <div className="absolute bottom-20 left-10 w-20 h-20 rounded-full bg-indigo-500/10 mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/3 right-20 w-32 h-32 rounded-full bg-pink-500/10 mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
    </section>
  );
};

export default Hero;
