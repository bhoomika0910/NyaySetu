import { Component } from "react";
import Button from "../ui/Button.jsx";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("App error", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center gap-4 p-6">
          <p className="text-2xl font-bold">Kuch gadbad ho gayi.</p>
          <p className="text-neutral-700">Kripya dobara koshish karein.</p>
          <Button variant="primary" onClick={this.handleReload} aria-label="Retry app">
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
