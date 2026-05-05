package http

import (
	"bytes"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/neurodynecorp/api/internal/app"
)

// PDFHandler handles PDF generation for project specifications.
type PDFHandler struct {
	specService *app.SpecService
}

// NewPDFHandler creates a new PDFHandler.
func NewPDFHandler(specService *app.SpecService) *PDFHandler {
	return &PDFHandler{specService: specService}
}

// GenerateSpecPDF generates a downloadable PDF for a given specification.
func (h *PDFHandler) GenerateSpecPDF(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}

	specID := strings.TrimPrefix(r.URL.Path, "/api/v1/specifications/")
	specID = strings.TrimSuffix(specID, "/pdf")

	if specID == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "specification id required"})
		return
	}

	spec, err := h.specService.GetSpec(r.Context(), specID)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "specification not found"})
		return
	}

	// Build the text content for the PDF.
	var content bytes.Buffer

	content.WriteString("PROJECT SPECIFICATION\n")
	content.WriteString(fmt.Sprintf("Generated: %s\n", time.Now().Format("January 2, 2006")))
	content.WriteString(strings.Repeat("=", 60) + "\n\n")

	// 1. Project Overview
	content.WriteString("1. PROJECT OVERVIEW\n")
	content.WriteString(strings.Repeat("-", 40) + "\n")
	if spec.Overview != "" {
		content.WriteString(spec.Overview + "\n")
	} else {
		content.WriteString("No overview provided.\n")
	}
	content.WriteString("\n")

	// 2. Objectives
	content.WriteString("2. OBJECTIVES\n")
	content.WriteString(strings.Repeat("-", 40) + "\n")
	if len(spec.Objectives) > 0 {
		for i, obj := range spec.Objectives {
			content.WriteString(fmt.Sprintf("  %d. %s\n", i+1, obj))
		}
	} else {
		content.WriteString("  No objectives defined.\n")
	}
	content.WriteString("\n")

	// 3. Feature Breakdown
	content.WriteString("3. FEATURE BREAKDOWN\n")
	content.WriteString(strings.Repeat("-", 40) + "\n")
	if len(spec.FeatureBreakdown) > 0 {
		for i, feature := range spec.FeatureBreakdown {
			content.WriteString(fmt.Sprintf("  %d. %s [%s]\n", i+1, feature.Name, feature.Priority))
			if feature.Description != "" {
				content.WriteString(fmt.Sprintf("     %s\n", feature.Description))
			}
			if feature.EstimatedHrs > 0 {
				content.WriteString(fmt.Sprintf("     Estimated Hours: %.1f\n", feature.EstimatedHrs))
			}
			for _, sub := range feature.SubFeatures {
				content.WriteString(fmt.Sprintf("       - %s\n", sub))
			}
		}
	} else {
		content.WriteString("  No features defined.\n")
	}
	content.WriteString("\n")

	// 4. Timeline Estimate
	content.WriteString("4. TIMELINE ESTIMATE\n")
	content.WriteString(strings.Repeat("-", 40) + "\n")
	content.WriteString(fmt.Sprintf("  Total Duration: %d weeks\n", spec.TimelineEstimate.TotalWeeks))
	if len(spec.TimelineEstimate.Phases) > 0 {
		content.WriteString("\n  Phases:\n")
		for _, phase := range spec.TimelineEstimate.Phases {
			content.WriteString(fmt.Sprintf("    - %s: %d weeks\n", phase.Name, phase.Weeks))
			if phase.Details != "" {
				content.WriteString(fmt.Sprintf("      %s\n", phase.Details))
			}
		}
	}
	content.WriteString("\n")

	// 5. Cost Estimate
	content.WriteString("5. COST ESTIMATE\n")
	content.WriteString(strings.Repeat("-", 40) + "\n")
	content.WriteString(fmt.Sprintf("  Range: %s %.2f - %.2f\n",
		spec.CostEstimate.Currency,
		spec.CostEstimate.TotalMin,
		spec.CostEstimate.TotalMax,
	))
	if len(spec.CostEstimate.Breakdown) > 0 {
		content.WriteString("\n  Breakdown:\n")
		for _, item := range spec.CostEstimate.Breakdown {
			content.WriteString(fmt.Sprintf("    - %s: %.2f - %.2f\n", item.Category, item.Min, item.Max))
		}
	}
	content.WriteString("\n")

	// 6. Assumptions & Risks
	content.WriteString("6. ASSUMPTIONS & RISKS\n")
	content.WriteString(strings.Repeat("-", 40) + "\n")
	if len(spec.Assumptions) > 0 {
		content.WriteString("\n  Assumptions:\n")
		for i, a := range spec.Assumptions {
			content.WriteString(fmt.Sprintf("    %d. %s\n", i+1, a))
		}
	}
	if len(spec.Risks) > 0 {
		content.WriteString("\n  Risks:\n")
		for i, risk := range spec.Risks {
			content.WriteString(fmt.Sprintf("    %d. %s\n", i+1, risk.Description))
			content.WriteString(fmt.Sprintf("       Impact: %s\n", risk.Impact))
			content.WriteString(fmt.Sprintf("       Mitigation: %s\n", risk.Mitigation))
		}
	}
	if len(spec.Assumptions) == 0 && len(spec.Risks) == 0 {
		content.WriteString("  No assumptions or risks documented.\n")
	}

	// Render the text content into a minimal valid PDF.
	pdfBytes := buildPDF(content.String())

	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="spec-%s.pdf"`, specID))
	w.Header().Set("Content-Length", fmt.Sprintf("%d", len(pdfBytes)))
	w.WriteHeader(http.StatusOK)
	w.Write(pdfBytes)
}

// buildPDF constructs a minimal valid PDF document from plain text content.
// It manually writes the PDF header, catalog, pages, font, and a single-page
// text stream using the standard PDF structure.
func buildPDF(text string) []byte {
	var buf bytes.Buffer
	offsets := make([]int, 0, 8)

	// Record the byte offset before writing each object.
	recordOffset := func() {
		offsets = append(offsets, buf.Len())
	}

	// PDF header
	buf.WriteString("%PDF-1.4\n")

	// Object 1: Catalog
	recordOffset()
	buf.WriteString("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")

	// Object 2: Pages
	recordOffset()
	buf.WriteString("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")

	// Object 3: Page
	recordOffset()
	buf.WriteString("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /Font << /F1 4 0 R >> >> >>\nendobj\n")

	// Object 4: Font
	recordOffset()
	buf.WriteString("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n")

	// Build the content stream: render each line of text using Tj operators.
	var stream bytes.Buffer
	stream.WriteString("BT\n")
	stream.WriteString("/F1 9 Tf\n")
	stream.WriteString("50 742 Td\n")
	stream.WriteString("12 TL\n") // leading (line spacing)

	lines := strings.Split(text, "\n")
	for _, line := range lines {
		escaped := pdfEscapeString(line)
		stream.WriteString(fmt.Sprintf("(%s) '\n", escaped))
	}
	stream.WriteString("ET\n")
	streamBytes := stream.Bytes()

	// Object 5: Content stream
	recordOffset()
	buf.WriteString(fmt.Sprintf("5 0 obj\n<< /Length %d >>\nstream\n", len(streamBytes)))
	buf.Write(streamBytes)
	buf.WriteString("endstream\nendobj\n")

	// Cross-reference table
	xrefOffset := buf.Len()
	buf.WriteString("xref\n")
	buf.WriteString(fmt.Sprintf("0 %d\n", len(offsets)+1))
	buf.WriteString("0000000000 65535 f \n")
	for _, offset := range offsets {
		buf.WriteString(fmt.Sprintf("%010d 00000 n \n", offset))
	}

	// Trailer
	buf.WriteString("trailer\n")
	buf.WriteString(fmt.Sprintf("<< /Size %d /Root 1 0 R >>\n", len(offsets)+1))
	buf.WriteString("startxref\n")
	buf.WriteString(fmt.Sprintf("%d\n", xrefOffset))
	buf.WriteString("%%EOF\n")

	return buf.Bytes()
}

// pdfEscapeString escapes special characters for PDF string literals.
func pdfEscapeString(s string) string {
	s = strings.ReplaceAll(s, `\`, `\\`)
	s = strings.ReplaceAll(s, `(`, `\(`)
	s = strings.ReplaceAll(s, `)`, `\)`)
	return s
}
