// import './App.css'
import BSTInsertionPracticeWrapper from "./features/bst-insertion/BSTInsertionPractice";
// Removed other imports like GraphGenerator for now to focus on BST
// import BSTRotationPractice from "./features/bst-rotation";

// Define theme colors with more visible options
const COLORS = {
  background: "#1e293b", // Lighter background to ensure visibility
  text: "#ffffff",
  accent: "#f43f5e",
};

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col">
      {/* Main content */}
      <div className="flex-grow">
        <BSTInsertionPracticeWrapper />
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-sm text-slate-400 pb-4">
        <p>Practice tool for learning Binary Search Tree operations</p>
      </footer>
    </div>
  );
}

export default App;
