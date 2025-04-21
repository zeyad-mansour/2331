// import './App.css'
import BSTInsertionPracticeWrapper from "./features/bst-insertion/BSTInsertionPractice";
// Removed other imports like GraphGenerator for now to focus on BST
import BSTRotationPractice from "./features/bst-rotation";

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-6xl flex flex-col flex-grow">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-pink-500 text-transparent bg-clip-text pb-2">
            BST Operations Practice
          </h1>
          <p className="text-slate-400">
            Interactive tools for learning BST insertion and rotations.
          </p>
        </header>

        {/* Main content */}
        <main className="flex-grow space-y-12">
          <BSTInsertionPracticeWrapper />
          <BSTRotationPractice />
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-slate-500 pt-4 border-t border-slate-700">
          <p>Developed for CSE 2331 Final Review</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
