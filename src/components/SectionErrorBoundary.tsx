import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Nome da seção, mostrado na mensagem de erro */
  label?: string;
}

interface State {
  hasError: boolean;
}

/**
 * Isola falhas de renderização em uma seção da tela.
 * Se o painel quebrar, o resto da página continua funcionando.
 */
export class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[SectionErrorBoundary:${this.props.label ?? 'seção'}]`, error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground flex items-center justify-between gap-3">
          <span>Não foi possível carregar {this.props.label ?? 'esta seção'}. O restante da tela continua funcionando.</span>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="shrink-0 px-3 py-1 rounded-lg border border-border/50 hover:bg-muted/40 transition-colors"
          >
            Tentar de novo
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
