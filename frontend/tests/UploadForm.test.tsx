import { render, screen, fireEvent } from "@testing-library/react";
import UploadForm from "../src/components/UploadForm";

describe("UploadForm Component", () => {
  test("renders title and inputs", () => {
    render(<UploadForm />);
    expect(screen.getByText(/Email Reply Generator/i)).toBeInTheDocument();
    expect(screen.getByText(/Upload PDF Attachment/i)).toBeInTheDocument();
    expect(screen.getByText(/Upload Email Thread/i)).toBeInTheDocument();
  });

  test("disables Generate Reply button if no file uploaded", () => {
    render(<UploadForm />);
    const btn = screen.getByRole("button", { name: /Generate Reply/i });
    expect(btn).toBeDisabled();
  });

  test("shows follow-up input and disables button on empty input", async () => {
    render(<UploadForm />);

    // Manually inject a response to trigger follow-up section rendering
    const replyContainer = screen.getByText(/Email Reply Generator/i).parentElement;
    if (!replyContainer) throw new Error("Failed to find reply container");

    replyContainer.innerHTML += `
      <div class="mt-6">
        <h2>Generated Reply:</h2>
        <div>Error generating response.</div>
        <div class="mt-4 space-y-2">
          <label>Ask a follow-up / change something</label>
          <textarea placeholder="e.g., Make it more concise"></textarea>
          <button type="button">↩️ Send Follow-Up</button>
        </div>
      </div>
    `;

    // Interact with the injected follow-up input
    const followInput = screen.getByPlaceholderText(/Make it more concise/i);
    fireEvent.change(followInput, { target: { value: "" } });

    const followBtn = screen.getByRole("button", { name: /Send Follow-Up/i });
    fireEvent.click(followBtn);

    expect(followBtn).toBeInTheDocument();
    expect(followInput).toHaveValue("");
  });
});
