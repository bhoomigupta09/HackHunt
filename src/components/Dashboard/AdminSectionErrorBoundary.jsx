import React from "react";

class AdminSectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || "A dashboard section failed to load."
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Admin dashboard section crashed:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-8 text-red-700 shadow-sm">
          <h3 className="text-lg font-semibold text-red-800">Admin section could not be displayed</h3>
          <p className="mt-2 text-sm leading-6">{this.state.errorMessage}</p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-4 rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AdminSectionErrorBoundary;
