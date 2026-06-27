import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { 
  FileText, ArrowLeft, Download, Clipboard, Printer, Share2, 
  Star, ThumbsUp, ThumbsDown, CheckCircle, ShieldAlert, Sparkles, 
  HelpCircle, AlertTriangle, RefreshCw 
} from 'lucide-react';

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Feedback states
  const [rating, setRating] = useState(5);
  const [like, setLike] = useState(true);
  const [comment, setComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/reports/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReport(res.data);
        
        // If feedback already exists, prefill
        if (res.data.feedback) {
          setRating(res.data.feedback.rating);
          setLike(res.data.feedback.like);
          setComment(res.data.feedback.comment || '');
          setFeedbackSubmitted(true);
        }
      } catch (err) {
        console.error('Error fetching report details:', err);
        setError('Failed to load report analysis.');
      } finally {
        setLoading(false);
      }
    };

    fetchReportDetails();
  }, [id]);

  const copyToClipboard = () => {
    if (!report) return;
    const ai = report.aiResponse;
    const text = `
Crownridge LLP - Project Delay Root Cause Report
Project Name: ${report.projectName}
Project ID: ${report.projectId}
Location: ${report.location}
Date: ${new Date(report.createdAt).toLocaleDateString()}

EXECUTIVE SUMMARY
${ai.executiveSummary}

ROOT CAUSE CLASSIFICATION: ${ai.rootCauseClassification}
PRIMARY CAUSE: ${ai.primaryCause}
DELAY SEVERITY: ${ai.delaySeverity}
RISK LEVEL: ${ai.riskLevel}
CONFIDENCE SCORE: ${ai.confidenceScore}%

CONTRIBUTING FACTORS:
${ai.contributingFactors.map(f => `- ${f}`).join('\n')}

BUSINESS IMPACT:
${ai.businessImpact}

RECOMMENDED MITIGATION PLAN:
${ai.recommendedMitigationPlan.map((m, idx) => `${idx + 1}. ${m}`).join('\n')}

PREVENTIVE MEASURES:
${ai.preventiveMeasures.map((p, idx) => `${idx + 1}. ${p}`).join('\n')}

ESTIMATED RECOVERY TIME: ${ai.estimatedRecoveryTime}
`;
    navigator.clipboard.writeText(text);
    alert('Analysis report copied to clipboard!');
  };

  const downloadTXT = () => {
    if (!report) return;
    const ai = report.aiResponse;
    const text = `
Crownridge LLP - Project Delay Root Cause Report
==================================================
Project Name: ${report.projectName}
Project ID: ${report.projectId}
Location: ${report.location}
Date: ${new Date(report.createdAt).toLocaleDateString()}

EXECUTIVE SUMMARY:
${ai.executiveSummary}

ROOT CAUSE CLASSIFICATION: ${ai.rootCauseClassification}
PRIMARY CAUSE: ${ai.primaryCause}
DELAY SEVERITY: ${ai.delaySeverity}
RISK LEVEL: ${ai.riskLevel}
CONFIDENCE SCORE: ${ai.confidenceScore}%

CONTRIBUTING FACTORS:
${ai.contributingFactors.map(f => `- ${f}`).join('\n')}

BUSINESS IMPACT:
${ai.businessImpact}

RECOMMENDED MITIGATION PLAN:
${ai.recommendedMitigationPlan.map((m, idx) => `${idx + 1}. ${m}`).join('\n')}

PREVENTIVE MEASURES:
${ai.preventiveMeasures.map((p, idx) => `${idx + 1}. ${p}`).join('\n')}

ESTIMATED RECOVERY TIME: ${ai.estimatedRecoveryTime}
==================================================
`;
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${report.projectName.replace(/\s+/g, '_')}_delay_report.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadPDF = () => {
    if (!report) return;
    const ai = report.aiResponse;
    const doc = new jsPDF();

    // Color definitions
    const primaryColor = [21, 128, 61]; // Forest Green
    const darkText = [30, 41, 59];
    const lightText = [100, 116, 139];

    // Page margin settings
    let y = 20;
    const margin = 20;
    const width = 170;

    // Header Logo & Branding
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("CROWNRIDGE LLP", margin, y);
    y += 6;
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(lightText[0], lightText[1], lightText[2]);
    doc.text("AI INFRASTRUCTURE PROJECT DELAY ROOT CAUSE REPORT", margin, y);
    y += 4;
    doc.setDrawColor(220, 225, 230);
    doc.line(margin, y, margin + width, y);
    y += 10;

    // Metadata Table Grid
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text("PROJECT INFORMATION", margin, y);
    y += 6;

    doc.setFont("Helvetica", "normal");
    doc.text(`Project Name: ${report.projectName}`, margin, y);
    doc.text(`Date: ${new Date(report.createdAt).toLocaleDateString()}`, margin + 90, y);
    y += 5;
    doc.text(`Project ID: ${report.projectId}`, margin, y);
    doc.text(`Location: ${report.location}`, margin + 90, y);
    y += 5;
    doc.text(`Project Manager: ${report.projectManager || 'N/A'}`, margin, y);
    doc.text(`Report Severity: ${report.severity}`, margin + 90, y);
    y += 8;
    doc.line(margin, y, margin + width, y);
    y += 10;

    // 1. Executive Summary
    doc.setFont("Helvetica", "bold");
    doc.text("1. EXECUTIVE SUMMARY", margin, y);
    y += 6;
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(ai.executiveSummary, width);
    doc.text(summaryLines, margin, y);
    y += (summaryLines.length * 5) + 8;

    // 2. Cause Classification
    doc.setFont("Helvetica", "bold");
    doc.text("2. ROOT CAUSE CLASSIFICATION", margin, y);
    y += 6;
    doc.setFont("Helvetica", "normal");
    doc.text(`Primary Category: ${ai.rootCauseClassification}`, margin, y);
    y += 5;
    
    const primaryCauseLines = doc.splitTextToSize(`Primary Cause: ${ai.primaryCause}`, width);
    doc.text(primaryCauseLines, margin, y);
    y += (primaryCauseLines.length * 5) + 6;

    // Contributing factors
    doc.setFont("Helvetica", "bold");
    doc.text("Contributing Factors Identified:", margin, y);
    y += 5;
    doc.setFont("Helvetica", "normal");
    ai.contributingFactors.forEach(factor => {
      const factorLines = doc.splitTextToSize(`- ${factor}`, width - 5);
      doc.text(factorLines, margin + 5, y);
      y += (factorLines.length * 5);
    });
    y += 8;

    // Check if space remaining is sufficient for rest, otherwise add page
    if (y > 220) {
      doc.addPage();
      y = 20;
    }

    // 3. Impact & Recovery
    doc.setFont("Helvetica", "bold");
    doc.text("3. BUSINESS IMPACT & CONTRACTUAL RISK", margin, y);
    y += 6;
    doc.setFont("Helvetica", "normal");
    const impactLines = doc.splitTextToSize(ai.businessImpact, width);
    doc.text(impactLines, margin, y);
    y += (impactLines.length * 5) + 6;

    doc.setFont("Helvetica", "bold");
    doc.text(`Estimated Recovery Timeline: ${ai.estimatedRecoveryTime}`, margin, y);
    doc.text(`AI Confidence Score: ${ai.confidenceScore}%`, margin + 90, y);
    y += 12;

    if (y > 220) {
      doc.addPage();
      y = 20;
    }

    // 4. Recommendations
    doc.setFont("Helvetica", "bold");
    doc.text("4. RECOMMENDED MITIGATION STRATEGIES (IMMEDIATE)", margin, y);
    y += 6;
    doc.setFont("Helvetica", "normal");
    ai.recommendedMitigationPlan.forEach((mit, idx) => {
      const mitLines = doc.splitTextToSize(`${idx + 1}. ${mit}`, width - 5);
      doc.text(mitLines, margin + 5, y);
      y += (mitLines.length * 5) + 2;
    });
    y += 6;

    if (y > 220) {
      doc.addPage();
      y = 20;
    }

    doc.setFont("Helvetica", "bold");
    doc.text("5. LONG-TERM PREVENTIVE MEASURES", margin, y);
    y += 6;
    doc.setFont("Helvetica", "normal");
    ai.preventiveMeasures.forEach((prev, idx) => {
      const prevLines = doc.splitTextToSize(`${idx + 1}. ${prev}`, width - 5);
      doc.text(prevLines, margin + 5, y);
      y += (prevLines.length * 5) + 2;
    });

    // Save
    doc.save(`${report.projectName.replace(/\s+/g, '_')}_delay_report.pdf`);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/feedback`, {
        reportId: id,
        rating,
        like,
        comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbackSubmitted(true);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to record rating feedback.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'Critical':
        return { text: 'text-red-400', bg: 'bg-red-950/50', border: 'border-red-900/30' };
      case 'High':
        return { text: 'text-orange-400', bg: 'bg-orange-950/50', border: 'border-orange-900/30' };
      case 'Medium':
        return { text: 'text-yellow-400', bg: 'bg-yellow-950/50', border: 'border-yellow-900/30' };
      default:
        return { text: 'text-blue-400', bg: 'bg-blue-950/50', border: 'border-blue-900/30' };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="p-6 rounded-2xl glass-panel border-white/5 text-center space-y-4">
        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
        <p className="text-red-400 font-semibold">{error}</p>
        <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-dark-900 border border-white/5 rounded-xl text-xs font-semibold cursor-pointer">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const ai = report.aiResponse;
  const sevStyle = getSeverityStyle(report.severity);

  return (
    <div className="space-y-8 animate-fade-in print:bg-white print:text-black">
      {/* Navigation & Export Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5 print:hidden">
        <button
          onClick={() => navigate('/history')}
          className="flex items-center gap-1.5 text-xs font-semibold text-dark-300 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </button>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-3 py-2 bg-dark-900 hover:bg-dark-800 text-xs font-semibold border border-white/5 rounded-xl transition-all cursor-pointer"
          >
            <Clipboard className="h-3.5 w-3.5" />
            Copy to Clipboard
          </button>
          <button
            onClick={downloadTXT}
            className="flex items-center gap-1.5 px-3 py-2 bg-dark-900 hover:bg-dark-800 text-xs font-semibold border border-white/5 rounded-xl transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Download TXT
          </button>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-1.5 px-3 py-2 bg-dark-900 hover:bg-dark-800 text-xs font-semibold border border-white/5 rounded-xl transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Download PDF Report
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-dark-900 hover:bg-dark-800 text-xs font-semibold border border-white/5 rounded-xl transition-all cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </button>
        </div>
      </div>

      {/* Main Analysis Report Block */}
      <div id="report-view-content" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Core Analysis Fields (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-8 rounded-3xl border-white/5 space-y-6 relative overflow-hidden">
            
            {/* Top banner logo */}
            <div className="flex justify-between items-start gap-4 flex-wrap border-b border-white/5 pb-5">
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-brand-400 uppercase">Crownridge Systems Diagnostic</span>
                <h2 className="text-2xl font-extrabold text-white mt-1">{report.projectName}</h2>
                <p className="text-dark-400 text-xs mt-1">ID: {report.projectId} • {report.location} • Filed on {new Date(report.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${sevStyle.bg} ${sevStyle.text} ${sevStyle.border}`}>
                {report.severity} Delay
              </span>
            </div>

            {/* Executive Summary */}
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-widest flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-brand-500" />
                Executive Summary
              </h3>
              <p className="text-dark-200 text-sm leading-relaxed bg-dark-900/50 p-4 rounded-xl border border-white/[0.02]">
                {ai.executiveSummary}
              </p>
            </div>

            {/* Primary Cause Callout */}
            <div className="p-5 rounded-2xl bg-brand-950/30 border border-brand-900/20 space-y-2 relative">
              <div className="absolute top-4 right-4 text-brand-500 opacity-20"><Sparkles className="h-8 w-8" /></div>
              <h4 className="text-xs font-extrabold text-brand-400 uppercase tracking-widest">Primary Root Cause</h4>
              <p className="text-white text-base font-bold leading-snug">{ai.primaryCause}</p>
              <div className="text-xs text-dark-300 font-semibold mt-1">Classification: <span className="text-brand-300">{ai.rootCauseClassification}</span></div>
            </div>

            {/* Contributing factors lists */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-widest">Contributing Factors</h3>
              <ul className="space-y-2">
                {ai.contributingFactors.map((factor, idx) => (
                  <li key={idx} className="text-sm text-dark-300 flex items-start gap-2.5 bg-dark-900/20 p-3 rounded-lg border border-white/5">
                    <span className="w-1.5 h-1.5 bg-brand-500 rounded-full shrink-0 mt-2"></span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Business Impact block */}
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-widest">Contractual & Business Impact</h3>
              <p className="text-sm text-dark-300 leading-relaxed bg-dark-900/30 p-4 rounded-xl border border-white/5">
                {ai.businessImpact}
              </p>
            </div>

            {/* Action Recommendations Splits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3 bg-emerald-950/20 p-5 rounded-2xl border border-emerald-900/20">
                <h4 className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest">Immediate Mitigations</h4>
                <ol className="space-y-3">
                  {ai.recommendedMitigationPlan.map((mit, idx) => (
                    <li key={idx} className="text-xs text-dark-200 flex gap-2">
                      <span className="font-extrabold text-brand-400">{idx + 1}.</span>
                      <span>{mit}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="space-y-3 bg-blue-950/20 p-5 rounded-2xl border border-blue-900/20">
                <h4 className="text-xs font-extrabold text-blue-400 uppercase tracking-widest">Preventive Measures</h4>
                <ol className="space-y-3">
                  {ai.preventiveMeasures.map((prev, idx) => (
                    <li key={idx} className="text-xs text-dark-200 flex gap-2">
                      <span className="font-extrabold text-blue-400">{idx + 1}.</span>
                      <span>{prev}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel Metrics & Feedback (1/3 width) */}
        <div className="space-y-6 print:hidden">
          
          {/* Side panel KPI list */}
          <div className="glass-panel p-6 rounded-3xl border-white/5 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-white/5 pb-2">Analysis Diagnostics</h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-dark-400 uppercase tracking-wider block">Estimated Recovery Time</span>
                <span className="inline-flex mt-1.5 px-3 py-1.5 rounded-lg bg-dark-900 text-white font-extrabold text-sm border border-white/5">
                  {ai.estimatedRecoveryTime}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-dark-400 uppercase tracking-wider block">Confidence Score</span>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 bg-dark-900 rounded-full h-2.5 overflow-hidden border border-white/5">
                    <div 
                      className="bg-brand-500 h-full rounded-full transition-all" 
                      style={{ width: `${ai.confidenceScore}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-white shrink-0">{ai.confidenceScore}%</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-dark-400 uppercase tracking-wider block">Assessed Risk Level</span>
                <span className={`inline-flex mt-1.5 px-2.5 py-1 rounded text-xs font-extrabold uppercase tracking-wide ${
                  ai.riskLevel === 'Critical' || ai.riskLevel === 'High' 
                    ? 'bg-red-950 text-red-400 border border-red-900/30' 
                    : 'bg-yellow-950 text-yellow-400 border border-yellow-900/30'
                }`}>
                  {ai.riskLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Feedback Form Card */}
          <div className="glass-panel p-6 rounded-3xl border-white/5 space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-white/5 pb-2">AI Response Quality</h3>
            
            {feedbackSubmitted ? (
              <div className="text-center py-6 space-y-2.5">
                <CheckCircle className="h-10 w-10 text-brand-500 mx-auto" />
                <h4 className="text-sm font-bold text-white">Feedback Submitted</h4>
                <p className="text-xs text-dark-400 leading-relaxed">Thank you. Your comments help us optimize the root cause classification pipeline.</p>
                <button 
                  onClick={() => setFeedbackSubmitted(false)}
                  className="mt-3 flex items-center gap-1 mx-auto text-xs font-semibold text-brand-400 hover:text-brand-300 cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" /> Edit Rating
                </button>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                
                {/* Rating selection (Stars) */}
                <div>
                  <label className="block text-[10px] font-bold text-dark-300 uppercase tracking-wide mb-2">Rate AI accuracy (1-5 Stars)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none transition-all scale-100 hover:scale-110 cursor-pointer"
                      >
                        <Star className={`h-6 w-6 ${
                          star <= rating 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-dark-600 hover:text-yellow-500'
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Like/Dislike slider */}
                <div>
                  <label className="block text-[10px] font-bold text-dark-300 uppercase tracking-wide mb-2">Recommendation Sentiment</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setLike(true)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        like 
                          ? 'bg-brand-950/50 text-brand-400 border-brand-500/40' 
                          : 'bg-dark-900 text-dark-500 border-transparent hover:text-dark-300'
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Helpful
                    </button>
                    <button
                      type="button"
                      onClick={() => setLike(false)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        !like 
                          ? 'bg-red-950/50 text-red-400 border-red-500/40' 
                          : 'bg-dark-900 text-dark-500 border-transparent hover:text-dark-300'
                      }`}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      Unhelpful
                    </button>
                  </div>
                </div>

                {/* Comment area */}
                <div>
                  <label className="block text-[10px] font-bold text-dark-300 uppercase tracking-wide mb-2">Remarks</label>
                  <textarea
                    rows={2.5}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                    placeholder="Provide details about recommended mitigations..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={feedbackLoading}
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-850 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {feedbackLoading ? 'Recording Feedback...' : 'Submit Rating'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetails;
