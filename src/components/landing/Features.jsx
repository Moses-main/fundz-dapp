import React from 'react';
import { motion, useInView } from 'framer-motion';
import { Zap, Lock, Users, Rocket, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: <Zap className="w-6 h-6 text-indigo-600" />,
    title: 'Dual Currency',
    description: 'Accept both crypto and fiat payments to maximize your fundraising potential and reach a global audience.',
    color: 'from-blue-500 to-indigo-500',
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-50'
  },
  {
    icon: <Lock className="w-6 h-6 text-indigo-600" />,
    title: 'Secure & Transparent',
    description: 'Blockchain-powered transparency ensures every transaction is secure, verifiable, and tamper-proof.',
    color: 'from-green-500 to-emerald-500',
    bg: 'bg-gradient-to-br from-green-50 to-emerald-50'
  },
  {
    icon: <Users className="w-6 h-6 text-indigo-600" />,
    title: 'Community First',
    description: 'Built-in social features help you engage with your community and grow your supporter base.',
    color: 'from-purple-500 to-pink-500',
    bg: 'bg-gradient-to-br from-purple-50 to-pink-50'
  },
  {
    icon: <Rocket className="w-6 h-6 text-indigo-600" />,
    title: 'Lightning Fast',
    description: 'Instant setup, real-time updates, and near-instant transactions powered by blockchain technology.',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50'
  }
];

const FeatureCard = ({ icon, title, description, index, color, bg }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      className={`group relative overflow-hidden p-0.5 rounded-xl bg-gradient-to-br ${bg} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1]
      }}
    >
      <div className="relative z-10 bg-white p-6 rounded-xl h-full">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${bg}`}>
          {React.cloneElement(icon, { className: `w-6 h-6 ${color.replace('from-', 'text-').split(' ')[0]}` })}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 mb-4 leading-relaxed">{description}</p>
        <div className="flex items-center text-sm font-medium text-indigo-600 group-hover:text-indigo-700 transition-colors">
          <span>Learn more</span>
          <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
      <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
    </motion.div>
  );
};

const Features = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  return (
    <section className="relative py-20 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-64 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-full mb-4">
            Powerful Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to Succeed
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Fundloom combines powerful blockchain technology with an intuitive interface to make fundraising seamless and effective.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <FeatureCard 
              key={index} 
              index={index} 
              {...feature} 
            />
          ))}
        </motion.div>
      </div>
      
      {/* Stats section */}
      <div className="mt-24 bg-white rounded-2xl shadow-xl p-8 max-w-5xl mx-4 sm:mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { number: '10K+', label: 'Campaigns' },
            { number: '$50M+', label: 'Raised' },
            { number: '500K+', label: 'Backers' },
            { number: '99.9%', label: 'Uptime' }
          ].map((stat, index) => (
            <motion.div 
              key={stat.label}
              className="p-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                {stat.number}
              </div>
              <div className="text-gray-500 mt-2">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
