import { Link } from 'react-router-dom';
import { ArrowRight, Edit3, Folder, Users, Zap } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const LandingPage = () => {

  return (
    <div className="min-h-screen">
      <header className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate rounded-lg flex items-center justify-center">
            
              <Edit3 className="w-5 h-5 text-white" />
            
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Chotaa Notion</span>
          </div>
          <div className="flex items-center gap-4">
            
            <ThemeToggle />
            <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-slate dark:hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/signup" className="btn-primary">
              Get Started
            </Link>
          
          </div>
        </div>
      </header>

      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 animate-fade-in">
            Put your ideas in this
            <span className="text-slate  dark:text-slate-light"> beautiful home</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto animate-slide-up">          
            With Chotaa Notion, you get the freedom to write, plan, and organize using powerful building blocks—tailored to work your way.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
          
            <Link to="/signup" className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
              Start writing for free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="text-slate dark:text-white btn-secondary text-lg px-8 py-4">
              Sign in to your workspace
            </Link>
          
          </div>
        </div>
      </section>

      
      <footer className="px-6 py-5 bg-slate-dark dark:bg-cream border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-slate rounded flex items-center justify-center">
          
              <Edit3 className="w-4 h-4 text-white" />
          
            </div>
            <span className="font-semibold text-gray-900 dark:text-slate-dark"> Team Chotaa Notion</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;