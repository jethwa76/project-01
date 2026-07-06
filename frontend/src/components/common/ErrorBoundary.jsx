import React from "react";
import Button from "./Button";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="container-page flex min-h-screen flex-col items-center justify-center text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Application error</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950 dark:text-white">Something needs attention.</h1>
          <p className="mt-4 max-w-xl text-slate-600 dark:text-slate-300">
            Refresh the page or return home. The backend will also return structured errors for failed API actions.
          </p>
          <Button className="mt-7" to="/">
            Go home
          </Button>
        </main>
      );
    }
    return this.props.children;
  }
}
