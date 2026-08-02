type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
	// SSR Fallback
	if (typeof document === 'undefined') return 'light';

	return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

class ThemeState {
	current = $state<Theme>(getInitialTheme());

	toggle(): void {
		this.current = this.current === 'dark' ? 'light' : 'dark';
		document.documentElement.classList.toggle('dark', this.current === 'dark');
		localStorage.setItem('theme', this.current);
	}

	// Unused - Future proof for a settings page
	set(theme: Theme): void {
		this.current = theme;
		document.documentElement.classList.toggle('dark', theme === 'dark');
		localStorage.setItem('theme', theme);
	}
}

export const theme = new ThemeState();
