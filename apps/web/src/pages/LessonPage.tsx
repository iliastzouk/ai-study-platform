import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../services/supabase";
import { generateLessonAssets, askLesson } from "../services/api";
import type { GeneratedAssets } from "../services/api";
import type { AiFlashcard, AiQuizItem, QuizAnswer } from "../services/supabase";
import { useAuthContext } from "../auth/useAuthContext";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type LessonRow = {
	id: string;
	title: string;
	content: string | null;
	lesson_number: number;
	module_id: string;
};

// ---------------------------------------------------------------------------
// Flashcard section
// ---------------------------------------------------------------------------
function FlashcardsSection({ cards }: { cards: AiFlashcard[] }) {
	const [flipped, setFlipped] = useState<Set<number>>(new Set());

	const toggle = (i: number) =>
		setFlipped((prev) => {
			const next = new Set(prev);
			if (next.has(i)) next.delete(i);
			else next.add(i);
			return next;
		});

	return (
		<div className="lessonSection">
			<h2 className="lessonSectionTitle">🃏 Flashcards</h2>
			<div className="flashcardsGrid">
				{cards.map((card, i) => (
					<button
						key={i}
						type="button"
						className={`flashcard${flipped.has(i) ? " flashcardFlipped" : ""}`}
						onClick={() => toggle(i)}
						aria-label={flipped.has(i) ? "Εμφάνιση ερώτησης" : "Εμφάνιση απάντησης"}
					>
						<div className="flashcardInner">
							<div className="flashcardFace flashcardFront">
								<div className="flashcardLabel">Ερώτηση</div>
								<p>{card.q}</p>
							</div>
							<div className="flashcardFace flashcardBack">
								<div className="flashcardLabel">Απάντηση</div>
								<p>{card.a}</p>
							</div>
						</div>
					</button>
				))}
			</div>
			<p className="kicker" style={{ marginTop: 10 }}>
				Κάντε κλικ σε κάθε κάρτα για να δείτε την απάντηση.
			</p>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Quiz section
// ---------------------------------------------------------------------------
type QuizSectionProps = {
	quiz: AiQuizItem[];
	lessonId: string;
	userId: string;
};

function QuizSection({ quiz, lessonId, userId }: QuizSectionProps) {
	const [selected, setSelected] = useState<Record<number, number>>({});
	const [state, setState] = useState<"idle" | "submitted" | "saving">("idle");
	const [score, setScore] = useState<number | null>(null);
	const [saveError, setSaveError] = useState<string | null>(null);

	const canSubmit =
		state === "idle" && Object.keys(selected).length === quiz.length;

	const handleSubmit = async () => {
		if (!canSubmit) return;
		setState("saving");
		setSaveError(null);

		const correct = quiz.filter(
			(q, i) => selected[i] === q.correct
		).length;
		const pct = Math.round((correct / quiz.length) * 10000) / 100;
		setScore(pct);

		const answers: QuizAnswer[] = Object.entries(selected).map(([qi, si]) => ({
			question_index: Number(qi),
			selected: si,
		}));

		const { error } = await supabase.from("quiz_attempts").insert({
			user_id: userId,
			lesson_id: lessonId,
			answers,
			score: pct,
		});

		if (error) setSaveError(error.message);
		setState("submitted");
	};

	return (
		<div className="lessonSection">
			<h2 className="lessonSectionTitle">❓ Quiz</h2>

			{state === "submitted" && score !== null && (
				<div className={`alert ${score >= 60 ? "alertSuccess" : "alertError"}`}>
					Βαθμολογία: <strong>{score}%</strong>{" "}
					({quiz.filter((q, i) => selected[i] === q.correct).length}/{quiz.length} σωστές)
					{saveError ? ` · Σφάλμα αποθήκευσης: ${saveError}` : ""}
				</div>
			)}

			<ol className="quizList">
				{quiz.map((item, qi) => {
					const isSubmitted = state === "submitted";
					const userChoice = selected[qi];
					return (
						<li key={qi} className="quizItem">
							<p className="quizQuestion">{item.question}</p>
							<div className="quizChoices">
								{item.choices.map((choice, ci) => {
									let chipClass = "quizChoice";
									if (isSubmitted) {
										if (ci === item.correct) chipClass += " quizChoiceCorrect";
										else if (ci === userChoice) chipClass += " quizChoiceWrong";
									}
									return (
										<label key={ci} className={chipClass}>
											<input
												type="radio"
												name={`q-${qi}`}
												value={ci}
												disabled={isSubmitted}
												checked={userChoice === ci}
												onChange={() =>
													setSelected((prev) => ({ ...prev, [qi]: ci }))
												}
											/>
											{choice}
										</label>
									);
								})}
							</div>
							{isSubmitted && (
								<p className="quizExplanation">
									💡 {item.explanation}
								</p>
							)}
						</li>
					);
				})}
			</ol>

			{state !== "submitted" && (
				<button
					type="button"
					className="btn btnPrimary"
					onClick={() => void handleSubmit()}
					disabled={!canSubmit}
				>
					{state === "saving" ? "Αποθήκευση..." : "Υποβολή απαντήσεων"}
				</button>
			)}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Chat section
// ---------------------------------------------------------------------------
type ChatMessage = { role: "user" | "ai"; text: string };

function ChatSection({
	lessonId,
	accessToken,
}: {
	lessonId: string;
	accessToken: string;
}) {
	const [input, setInput] = useState("");
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSend = async () => {
		const text = input.trim();
		if (!text || loading) return;

		setInput("");
		setError(null);
		setMessages((prev) => [...prev, { role: "user", text }]);
		setLoading(true);

		try {
			const { reply } = await askLesson(lessonId, text, accessToken);
			setMessages((prev) => [...prev, { role: "ai", text: reply }]);
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Σφάλμα επικοινωνίας";
			setError(msg);
		} finally {
			setLoading(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			void handleSend();
		}
	};

	return (
		<div className="lessonSection">
			<h2 className="lessonSectionTitle">💬 Ρώτα τον Εξεταστή</h2>
			<p className="kicker">
				Κάνε ερωτήσεις σχετικά με το μάθημα. Οι απαντήσεις βασίζονται
				αποκλειστικά στο περιεχόμενό του.
			</p>

			{messages.length > 0 && (
				<div className="chatMessages">
					{messages.map((m, i) => (
						<div
							key={i}
							className={`chatBubble ${m.role === "user" ? "chatBubbleUser" : "chatBubbleAi"}`}
						>
							{m.text}
						</div>
					))}
					{loading && (
						<div className="chatBubble chatBubbleAi chatBubbleLoading">
							Γράφει…
						</div>
					)}
				</div>
			)}

			{error && (
				<p className="alert alertError" role="alert">
					{error}
				</p>
			)}

			<div className="chatInputRow">
				<textarea
					rows={3}
					placeholder="Γράψε την ερώτησή σου… (Enter για αποστολή)"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={handleKeyDown}
					disabled={loading}
					className="chatInput"
				/>
				<button
					type="button"
					className="btn btnPrimary"
					onClick={() => void handleSend()}
					disabled={loading || !input.trim()}
				>
					Αποστολή
				</button>
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Summary section (collapsible)
// ---------------------------------------------------------------------------
function SummarySection({ summary }: { summary: string }) {
	const [open, setOpen] = useState(true);
	return (
		<div className="lessonSection">
			<button
				type="button"
				className="lessonSectionToggle"
				onClick={() => setOpen((v) => !v)}
				aria-expanded={open}
			>
				<h2 className="lessonSectionTitle">🧠 Σύνοψη AI</h2>
				<span className="toggleIcon">{open ? "▲" : "▼"}</span>
			</button>
			{open && <p className="summaryText">{summary}</p>}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export function LessonPage() {
	const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>();
	const { session } = useAuthContext();

	const [lesson, setLesson] = useState<LessonRow | null>(null);
	const [assets, setAssets] = useState<GeneratedAssets | null>(null);
	const [pageState, setPageState] = useState<"loading" | "ready" | "error">("loading");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!lessonId || !session?.access_token) return;

		const controller = new AbortController();

		const load = async () => {
			setPageState("loading");
			setError(null);

			// Fetch lesson
			const { data: lessonData, error: lessonError } = await supabase
				.from("lessons")
				.select("id, title, content, lesson_number, module_id")
				.eq("id", lessonId)
				.single();

			if (lessonError || !lessonData) {
				if (controller.signal.aborted) return;
				setError(lessonError?.message ?? "Το μάθημα δεν βρέθηκε.");
				setPageState("error");
				return;
			}

			// Fetch parent module for breadcrumb
			await supabase
				.from("modules")
				.select("id, title, course_id")
				.eq("id", lessonData.module_id)
				.single();

			if (controller.signal.aborted) return;
			setLesson(lessonData as LessonRow);

			// Generate / fetch AI assets
			try {
				const generated = await generateLessonAssets(
					lessonId,
					session.access_token
				);
				if (controller.signal.aborted) return;
				setAssets(generated);
			} catch {
				// Assets failed — still show the lesson content
				if (controller.signal.aborted) return;
			}

			setPageState("ready");
		};

		void load();
		return () => controller.abort();
	}, [lessonId, session?.access_token]);

	// ------------------------------------------------------------------
	// States
	// ------------------------------------------------------------------
	if (pageState === "loading") {
		return (
			<section>
				<p>Φόρτωση μαθήματος…</p>
			</section>
		);
	}

	if (pageState === "error" || !lesson) {
		return (
			<section>
				<p className="alert alertError" role="alert">
					{error ?? "Το μάθημα δεν βρέθηκε."}
				</p>
				<Link to={slug ? `/courses/${slug}` : "/courses"} className="btn">
					← Πίσω στο μάθημα
				</Link>
			</section>
		);
	}

	// ------------------------------------------------------------------
	// Render
	// ------------------------------------------------------------------
	return (
		<section>
			<nav className="breadcrumb">
				<Link to="/courses">Μαθήματα</Link>
				{slug && <Link to={`/courses/${slug}`}>← Πίσω</Link>}
			</nav>

			<h1 className="h1" style={{ marginTop: 12, marginBottom: 24 }}>
				{lesson.lesson_number}. {lesson.title}
			</h1>

			{/* 1 — Lesson content */}
			<div className="lessonSection">
				<h2 className="lessonSectionTitle">📖 Περιεχόμενο</h2>
				{lesson.content ? (
					// Content stored as plain text / markdown.
					// Rendered as preformatted text for Phase 1 safety.
					// Replace with a markdown renderer (e.g. marked + DOMPurify) in Phase 2.
					<pre className="lessonContent">{lesson.content}</pre>
				) : (
					<p className="kicker">Δεν υπάρχει ακόμα περιεχόμενο για αυτό το μάθημα.</p>
				)}
			</div>

			{/* AI sections — only if assets loaded */}
			{assets ? (
				<>
					{/* 2 — AI Summary */}
					{assets.summary && <SummarySection summary={assets.summary} />}

					{/* 3 — Flashcards */}
					{assets.flashcards && assets.flashcards.length > 0 && (
						<FlashcardsSection cards={assets.flashcards} />
					)}

					{/* 4 — Quiz */}
					{assets.quiz && assets.quiz.length > 0 && session?.user?.id && (
						<QuizSection
							quiz={assets.quiz}
							lessonId={lesson.id}
							userId={session.user.id}
						/>
					)}
				</>
			) : (
				<div className="lessonSection">
					<p className="kicker">
						Το AI υλικό δεν ήταν διαθέσιμο. Δοκιμάστε ξανά αργότερα.
					</p>
				</div>
			)}

			{/* 5 — Chat */}
			{session?.access_token && (
				<ChatSection
					lessonId={lesson.id}
					accessToken={session.access_token}
				/>
			)}
		</section>
	);
}

export default LessonPage;
