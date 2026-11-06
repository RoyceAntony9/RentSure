import React from 'react'
import heroBannerImg from '../assets/rentsure-hero-banner.jpg'
import { Sparkles, ArrowRight } from 'lucide-react'

export function HeroBanner({ onExploreSamples, onStartUpload }) {
  return (
    <section className="rs-hero-card">
      {/* Top Header Labels */}
      <div className="rs-hero-meta-row">
        <div className="rs-hero-meta-left">
          <span className="rs-meta-sub">Project By</span>
          <span className="rs-meta-strong">Team RentSure</span>
        </div>
        <div className="rs-hero-meta-right">
          <span className="rs-meta-sub">AI in Rental</span>
          <span className="rs-meta-strong">Agreements</span>
        </div>
      </div>

      {/* Main Architectural Hero Stage */}
      <div className="rs-hero-stage">
        {/* Left 'START' Badge with Red Semi-Circle */}
        <div className="rs-side-badge rs-badge-left" title="Start RentSure Journey">
          <span className="rs-side-circle"></span>
          <span className="rs-side-text">START</span>
        </div>

        {/* Right 'PROJECT' Badge with Red Semi-Circle */}
        <div className="rs-side-badge rs-badge-right" title="Project Documentation">
          <span className="rs-side-circle"></span>
          <span className="rs-side-text">PROJECT</span>
        </div>

        {/* Hero Banner Background & Title Layer */}
        <div className="rs-hero-visual-wrap">
          <img
            src={heroBannerImg}
            alt="RentSure Architectural Master Banner"
            className="rs-hero-banner-image"
          />
          <div className="rs-hero-visual-overlay"></div>
        </div>

        {/* Red Pill Banner from the Design */}
        <div className="rs-hero-pill-badge">
          <span className="rs-pill-dot"></span>
          AI-Driven Rental Agreement Analysis & Blockchain Escrow
        </div>

        {/* Taglines and AI Pillars */}
        <div className="rs-hero-footer-copy">
          <h2 className="rs-hero-subtitle">Project Documentation with AI Perspective</h2>
          <div className="rs-hero-pillars">
            <span>Knowledge Representation</span>
            <span className="rs-red-bullet">•</span>
            <span>Reasoning</span>
            <span className="rs-red-bullet">•</span>
            <span>Learning</span>
            <span className="rs-red-bullet">•</span>
            <span>NLP</span>
            <span className="rs-red-bullet">•</span>
            <span>Planning</span>
          </div>
        </div>
      </div>

      {/* Quick Launch CTA Strip */}
      <div className="rs-hero-actions-bar">
        <div className="rs-hero-status-pill">
          <span className="rs-live-dot"></span>
          <span>FastAPI NLP Active &bull; Ganache Smart Escrow Ready</span>
        </div>
        <div className="rs-hero-btn-group">
          <button className="rs-btn-outline" onClick={onExploreSamples}>
            <Sparkles size={16} /> Explore 3 Sample Leases
          </button>
          <button className="rs-btn-primary" onClick={onStartUpload}>
            Audit Agreement Now <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}
