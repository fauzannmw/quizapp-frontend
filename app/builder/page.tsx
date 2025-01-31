"use client";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface QuestionType {
  id: string;
  label: string;
}

const QUESTION_TYPES: QuestionType[] = [
  { id: "multiple-choice", label: "Multiple Choice" },
  { id: "short-answer", label: "Short Answer" },
  { id: "matching", label: "Matching" },
  { id: "true-false", label: "True / False" },
  { id: "fill-in-the-blank", label: "Fill in the Blank" },
];

interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  correctAnswer?: string;
}

interface Section {
  id: string;
  title: string;
  description: string;
  media?: string;
  mediaType?: string;
  questions: Question[];
}

export default function QuestionBuilder() {
  const [sections, setSections] = useState<Section[]>([]);
  const [draggedItem, setDraggedItem] = useState<QuestionType | null>(null);
  const [draggedQuestion, setDraggedQuestion] = useState<{
    sectionId: string;
    questionId: string;
  } | null>(null);

  const addSection = () => {
    setSections([
      ...sections,
      {
        id: uuidv4(),
        title: "",
        description: "",
        media: "",
        mediaType: "",
        questions: [],
      },
    ]);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    sectionId: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileType = file.type.startsWith("image")
        ? "image"
        : file.type.startsWith("audio")
        ? "audio"
        : "other";
      const fileURL = URL.createObjectURL(file);
      setSections(
        sections.map((s) =>
          s.id === sectionId ? { ...s, media: fileURL, mediaType: fileType } : s
        )
      );
    }
  };

  const handleDragStart = (type: QuestionType) => {
    setDraggedItem(type);
  };

  const handleDrop = (sectionId: string) => {
    if (draggedItem) {
      setSections(
        sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                questions: [
                  ...section.questions,
                  { id: uuidv4(), type: draggedItem, text: "" },
                ],
              }
            : section
        )
      );
      setDraggedItem(null);
    }
  };

  const handleDragStartQuestion = (sectionId: string, questionId: string) => {
    setDraggedQuestion({ sectionId, questionId });
  };

  const handleDropQuestion = (sectionId: string, targetIndex: number) => {
    if (!draggedQuestion) return;

    setSections((prevSections) => {
      return prevSections.map((section) => {
        if (section.id === sectionId) {
          const questionList = [...section.questions];
          const draggedIndex = questionList.findIndex(
            (q) => q.id === draggedQuestion.questionId
          );

          if (draggedIndex !== -1) {
            const [draggedQuestionObj] = questionList.splice(draggedIndex, 1);
            questionList.splice(targetIndex, 0, draggedQuestionObj);
          }

          return { ...section, questions: questionList };
        }
        return section;
      });
    });

    setDraggedQuestion(null);
  };

  const handleDeleteQuestion = (sectionId: string, questionId: string) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.filter((q) => q.id !== questionId),
            }
          : section
      )
    );
  };

  return (
    <main className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Question Builder</h1>
        <button
          onClick={addSection}
          className="mb-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          + Add Section
        </button>

        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-1 bg-gray-200 p-4 rounded-lg">
            <h2 className="text-lg font-semibold">Question Types</h2>
            {QUESTION_TYPES.map((type) => (
              <div
                key={type.id}
                draggable
                onDragStart={() => handleDragStart(type)}
                className="bg-gray-300 p-2 rounded-lg cursor-move mt-2"
              >
                {type.label}
              </div>
            ))}
          </div>

          <div className="col-span-3 space-y-6">
            {sections.map((section) => (
              <div
                key={section.id}
                className="bg-white p-4 shadow-md rounded-lg border border-gray-300"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(section.id)}
              >
                <input
                  type="file"
                  className="w-full p-2 border rounded-md mb-2"
                  accept="image/*,audio/*"
                  onChange={(e) => handleFileChange(e, section.id)}
                />
                {section.media &&
                  (section.mediaType === "image" ? (
                    <img
                      src={section.media}
                      alt="Uploaded"
                      className="w-full h-auto rounded-md mb-2"
                    />
                  ) : section.mediaType === "audio" ? (
                    <audio controls className="w-full mb-2">
                      <source src={section.media} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  ) : null)}
                <input
                  type="text"
                  placeholder="Section Title"
                  className="w-full p-2 border rounded-md mb-2"
                  value={section.title}
                  onChange={(e) =>
                    setSections(
                      sections.map((s) =>
                        s.id === section.id
                          ? { ...s, title: e.target.value }
                          : s
                      )
                    )
                  }
                />
                <input
                  type="text"
                  placeholder="Section Description"
                  className="w-full p-2 border rounded-md mb-2"
                  value={section.description}
                  onChange={(e) =>
                    setSections(
                      sections.map((s) =>
                        s.id === section.id
                          ? { ...s, description: e.target.value }
                          : s
                      )
                    )
                  }
                />

                <p className="text-gray-500">Drag and drop questions here</p>
                {section.questions.map((question, qIndex) => (
                  <div
                    key={question.id}
                    className="bg-gray-100 p-3 mt-2 rounded-md cursor-move"
                    draggable
                    onDragStart={() =>
                      handleDragStartQuestion(section.id, question.id)
                    }
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDropQuestion(section.id, qIndex)}
                  >
                    <h3 className="font-semibold">
                      Question {qIndex + 1}: {question.type.label}
                    </h3>
                    <input
                      type="text"
                      placeholder="Enter your question"
                      className="w-full mt-2 p-2 border rounded-md"
                      value={question.text}
                      onChange={(e) =>
                        setSections(
                          sections.map((s) =>
                            s.id === section.id
                              ? {
                                  ...s,
                                  questions: s.questions.map((q) =>
                                    q.id === question.id
                                      ? { ...q, text: e.target.value }
                                      : q
                                  ),
                                }
                              : s
                          )
                        )
                      }
                    />
                    <button
                      onClick={() =>
                        handleDeleteQuestion(section.id, question.id)
                      }
                      className="mt-2 bg-red-500 text-white px-4 py-2 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
