import React, { useRef, useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";

const UploadForm: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [emailFile, setEmailFile] = useState<File | null>(null);
  const [pdfName, setPdfName] = useState<string>("");
  const [emailName, setEmailName] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [tone, setTone] = useState<string>("Professional");
  const tones = ["Professional", "Friendly", "Assertive", "Kind", "Enthusiastic"];
  const [feedback, setFeedback] = useState<string>("");
  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 2000);
  };
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const [summarizing, setSummarizing] = useState<boolean>(false);
  const [summaryOutput, setSummaryOutput] = useState<string>("");
  const [pdfPreview, setPdfPreview] = useState<string>("");
  const [emailPreview, setEmailPreview] = useState<string>("");
  const [strategy, setStrategy] = useState<string>("Standard");
  const strategies = [
    "Standard",
    "Concise reply",
    "Elaborate reply"
  ];
  const [chatHistory, setChatHistory] = useState<{ user: string; bot: string }[]>([]);
  const [followupPrompt, setFollowupPrompt] = useState<string>("");
  const [isFollowupLoading, setIsFollowupLoading] = useState<boolean>(false);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pdfFile && !emailFile) {
      alert("Please upload at least one file.");
      return;
    }

    const formData = new FormData();
    if (pdfFile) formData.append("pdf", pdfFile);
    if (emailFile) formData.append("email", emailFile);
    formData.append("tone", tone);
    formData.append("strategy", strategy);
    try {
      setLoading(true);
      const res = await axios.post<{ reply: string }>(
        "http://127.0.0.1:8000/generate-reply",
        formData
      );
      setResponse(res.data.reply);
      if (window.scrollY < 50) {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 300);
      }


    } catch (err: any) {
      console.error("Error:", err);
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        showFeedback("⏱ Too many requests. Please wait and try again.");
      } else {
        setResponse("Error generating response.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPreview = async (file: File, setPreview: (text: string) => void) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post<{ text: string }>("http://127.0.0.1:8000/preview-text", formData);
      setPreview(res.data.text);
    } catch (err) {
      console.error("Preview error:", err);
      setPreview("Failed to load preview.");
    }
  };

  const handleFileChange = (
    setter: (file: File) => void,
    setName: (name: string) => void,
    setPreview: (text: string) => void
  ) => (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ["application/pdf", "text/plain", "message/rfc822"];
    if (!allowedTypes.includes(file.type)) {
      showFeedback("Unsupported file type.");
      return;
    }

    // Optional: Limit size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      showFeedback("File too large (max 5MB).");
      return;
    }

    setter(file);
    setName(file.name);
    fetchPreview(file, setPreview);
    setChatHistory([]);
  };


  const handleFollowup = async () => {
    if (!followupPrompt.trim()) {
      showFeedback("Please enter a follow-up prompt.");
      return;
    }

    setIsFollowupLoading(true);
    try {
      const res = await axios.post<{ reply: string }>("http://127.0.0.1:8000/followup-reply", {
        previous: response,
        prompt: followupPrompt,
      });
      const newReply = res.data.reply;
      setChatHistory((prev) => [...prev, { user: followupPrompt, bot: newReply }]);
      setResponse(newReply);
      setFollowupPrompt("");
      // Scroll to top after response
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Follow-up error:", err);
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        showFeedback("⏱ Too many requests. Please wait and try again.");
      } else {
        showFeedback("Follow-up failed.");
      }
    } finally {
      setIsFollowupLoading(false);
    }
  };


  return (
    <div className="w-full pb-32 max-w-7xl mx-auto mt-10 p-4 bg-white/90 backdrop-blur-sm border rounded-xl shadow-xl text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-center">Email Reply Generator</h1>
      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
        {/* LEFT COLUMN: Upload + Preview */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div>
            <label className="block font-semibold mb-1">Upload PDF Attachment</label>
            <input
              ref={pdfInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange(setPdfFile, setPdfName, setPdfPreview)}
              className="block w-full border rounded bg-white px-3 py-2 text-gray-800"
            />
            {pdfName && <p className="text-sm text-gray-600 mt-1">{pdfName} uploaded</p>}
            <button
              type="button"
              onClick={() => {
                setPdfFile(null);
                setPdfName("");
                setPdfPreview("");
                if (pdfInputRef.current) {
                  pdfInputRef.current.value = "";
                }
              }}
              className="text-red-500 hover:underline"
            >
              Remove
            </button>
          </div>
          <div>
            <label className="block font-semibold mb-1">Upload Email Thread (TXT or EML)</label>
            <input
              ref={emailInputRef}
              type="file"
              accept=".txt,.eml"
              onChange={handleFileChange(setEmailFile, setEmailName, setEmailPreview)}
              className="block w-full border rounded bg-white px-3 py-2 text-gray-800"
            />
            {emailName && <p className="text-sm text-gray-600 mt-1">{emailName} uploaded</p>}
            <button
              type="button"
              onClick={() => {
                setEmailFile(null);
                setEmailName("");
                setEmailPreview("");
                if (emailInputRef.current) {
                  emailInputRef.current.value = "";
                }
              }}
              className="text-red-500 hover:underline"
            >
              Remove
            </button>
          </div>
          {(pdfPreview || emailPreview) && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Preview Uploaded Content</h2>
              {emailPreview && (
                <div className="mb-6">
                  <h3 className="font-bold mb-1">Email Preview:</h3>
                  <div className="bg-gray-100 p-4 rounded border text-sm whitespace-pre-wrap text-gray-800 max-h-64 overflow-y-auto">
                    {emailPreview}
                  </div>
                </div>
              )}
              {pdfPreview && (
                <div>
                  <h3 className="font-bold mb-1">PDF Preview:</h3>
                  <div className="bg-gray-100 p-4 rounded border text-sm whitespace-pre-wrap text-gray-800 max-h-64 overflow-y-auto">
                    {pdfPreview}
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setPdfFile(null);
                  setEmailFile(null);
                  setPdfName("");
                  setEmailName("");
                  setPdfPreview("");
                  setEmailPreview("");
                  setSummaryOutput("");
                  setResponse("");
                  setFeedback("");
                  if (pdfInputRef.current) pdfInputRef.current.value = "";
                  if (emailInputRef.current) emailInputRef.current.value = "";
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                ❌ Clear All
              </button>

            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Summary + Tone/Strategy + Reply */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="border border-yellow-400 p-4 rounded bg-yellow-50 shadow-sm">
            <h3 className="text-md font-semibold text-yellow-700 mb-2">
              🧠 Summarize Uploaded Content
            </h3>
            <button
              type="button"
              disabled={!pdfFile && !emailFile}
              onClick={async () => {
                setSummarizing(true);
                let combinedSummary = "";

                try {
                  if (pdfFile) {
                    const formData = new FormData();
                    formData.append("pdf", pdfFile);
                    const res = await axios.post<{ summary: string }>("http://127.0.0.1:8000/summarize-pdf", formData);
                    combinedSummary += "📄 PDF Summary:\n" + res.data.summary + "\n";
                  }

                  if (emailFile) {
                    const formData = new FormData();
                    formData.append("email", emailFile);
                    const res = await axios.post<{ summary: string }>("http://127.0.0.1:8000/summarize-email", formData);
                    if (combinedSummary) combinedSummary += "\n------------------------------\n";
                    combinedSummary += "✉️ Email Summary:\n" + res.data.summary;
                  }

                  setSummaryOutput(combinedSummary || "No file uploaded.");
                } catch (err) {
                  console.error("Summarize error:", err);
                  setSummaryOutput("Failed to summarize uploaded content.");
                } finally {
                  setSummarizing(false);
                }
              }}
              className={`px-4 py-2 rounded transition text-white ${pdfFile || emailFile
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-yellow-300 cursor-not-allowed"
                }`}
            >
              {summarizing ? "Summarizing..." : "🧠 Summarize"}
            </button>

            <div className="mt-4 text-sm bg-white p-4 border rounded text-gray-800 whitespace-pre-wrap min-h-[120px]">
              <strong>Summary Output:</strong><br />
              {summaryOutput || "No summary yet."}
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Select Response Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="block w-full border rounded px-3 py-2 bg-white text-gray-800"
            >
              {tones.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Select Agent Strategy</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="block w-full border rounded px-3 py-2 bg-white text-gray-800"
            >
              {strategies.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || (!pdfFile && !emailFile)}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Generating..." : "Generate Reply"}
          </button>

          {response && (
            <div className="mt-6">
              <h2 className="text-2xl font-semibold mb-4">Generated Reply:</h2>
              <div className="bg-gray-100 p-6 rounded-lg border whitespace-pre-wrap text-gray-800">
                {response}
              </div>
              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(response);
                    showFeedback("Copied to clipboard!");
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  📋 Copy
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([response], { type: "text/plain;charset=utf-8" });
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = "generated_reply.txt";
                    link.click();
                    showFeedback("File downloaded!");
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  ⬇️ Download
                </button>
              </div>
              {feedback && (
                <div className="mt-2 text-sm text-green-700 font-medium">{feedback}</div>
              )}
              {response && (
                <div className="mt-6">

                  {/* Follow-up prompt box */}
                  <div className="mt-4 space-y-2">
                    <label className="font-semibold block">Ask a follow-up / change something</label>
                    <textarea
                      value={followupPrompt}
                      onChange={(e) => setFollowupPrompt(e.target.value)}
                      className="w-full border rounded p-2 bg-white text-sm text-gray-800"
                      rows={3}
                      placeholder="e.g., Make it more concise"
                    />
                    <button
                      type="button"
                      onClick={handleFollowup}
                      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
                    >
                      {isFollowupLoading ? "Generating..." : "↩️ Send Follow-Up"}
                    </button>

                  </div>

                  {/* Show previous turns */}
                  {chatHistory.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">Conversation History</h3>
                      <div className="space-y-4 text-sm">
                        {chatHistory.map((entry, idx) => (
                          <div key={idx} className="bg-gray-50 p-3 rounded border">
                            <p className="text-purple-700 font-medium mb-1">You: {entry.user}</p>
                            <p className="text-gray-800 whitespace-pre-wrap">AI: {entry.bot}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default UploadForm;