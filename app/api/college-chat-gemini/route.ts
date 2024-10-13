/* eslint-disable @typescript-eslint/no-unused-vars */

import { queryPineconeVectorStore } from "@/utils";
import { Pinecone } from "@pinecone-database/pinecone";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, Message, StreamData, streamText } from "ai";

export const maxDuration = 60;

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY ?? "",
});

const google = createGoogleGenerativeAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta",
  apiKey: process.env.GEMINI_API_KEY,
});

const model = google("models/gemini-1.5-pro-latest", {
  safetySettings: [
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
  ],
});

// Add this fallback information
const fallbackCollegeInfo = `
Wadia College of Engineering, Pune, is a premier institution offering a variety of engineering programs:

1. **Academic Programs**: We provide undergraduate and postgraduate degrees in core engineering fields like Computer Science, Mechanical, Civil, Electronics & Telecommunications, and Information Technology.

2. **Campus Life**: Our campus is vibrant, with student organizations, technical clubs, sports teams, and cultural events. We actively encourage students to engage in extracurricular activities to foster a well-rounded personality.

3. **Facilities**: Wadia College boasts modern classrooms, fully-equipped labs, a digital library, and dedicated research centers to support students in their academic pursuits. Additionally, the campus has recreational areas and sports facilities.

4. **Support Services**: We offer comprehensive support services including academic advising, career counseling, mental health programs, and tutoring to ensure the well-being and success of our students.

5. **Research & Development**: Our faculty and students participate in innovative research projects across diverse engineering fields. We collaborate with industries and research institutions to push the boundaries of knowledge.

6. **Admissions**: Our admissions process is transparent and based on academic merit, entrance exam performance, and extracurricular achievements.

7. **Financial Aid**: We provide scholarships, grants, and financial assistance programs to deserving students to help finance their education.

For further details or specific queries about Wadia College, feel free to ask.
`;

export async function POST(req: Request, res: Response) {
  const reqBody = await req.json();
  console.log(reqBody);

  const messages: Message[] = reqBody.messages;
  const userQuestion = `${messages[messages.length - 1].content}`;

  const query = `Represent this for searching relevant college information: ${userQuestion}`;

  const retrievals = await queryPineconeVectorStore(
    pinecone,
    "ai-college",
    "ns-1",
    query
  );

  console.log("retrivals: ", retrievals);

  const finalPrompt = `You are an AI assistant for Wadia College of Engineering, Pune's website. Use the provided college information to answer the user's query accurately and helpfully. If specific data is unavailable in the retrieved information, use the fallback information to give the best possible response. Always generate your response in Markdown format to allow for clear formatting of text, tables, and links.

\n\n**User Query:**\n${userQuestion}
\n**End of User Query** 

\n\n**Relevant College Information:**
\n\n${
    retrievals !== "<no relevant information found>"
      ? retrievals
      : fallbackCollegeInfo
  }
\n\n**End of College Information** 

\n\n**Response Guidelines:**
1. **General Queries**: Provide a clear and detailed answer in Markdown, using bullet points, headings, or paragraphs as needed. Always maintain a friendly tone.
2. **For Table Requests**: If the user requests data in table form (e.g., course details, fee structure), format the response using Markdown table syntax for clarity.
3. **For Links**: If the query is about admissions, courses, or other resources, include helpful Markdown links to relevant sections (e.g., admissions page, program information, contact forms).
4. **Missing Information**: If the user's question isn't fully covered by the available information, provide general details and suggest where they might find more specific data.
5. **Markdown Usage**: Ensure responses can include headings (e.g., ##), bullet points (e.g., -), tables, and links (e.g., [Link Text](URL)).

\n\n**Answer (in Markdown format):**
`;

  const data = new StreamData();

  data.append({
    retrievals: retrievals,
  });

  const result = await streamText({
    model: model,
    prompt: finalPrompt,
    onFinish() {
      data.close();
    },
  });

  return result.toDataStreamResponse({ data });
}
