/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		fontFamily: {
  			dm: ['DM Sans', 'sans-serif'],
  			inter: ['Inter', 'sans-serif'],
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			navy: {
  				DEFAULT: 'hsl(var(--navy))',
  				light: 'hsl(var(--navy-light))',
  				mid: 'hsl(var(--navy-mid))',
  			},
  			teal: {
  				DEFAULT: 'hsl(var(--teal))',
  				light: 'hsl(var(--teal-light))',
  			},
  			brand: {
  				DEFAULT: 'hsl(var(--navy))',
  				light: 'hsl(var(--navy-light))',
  			},
  			chart: {
  				'1': 'hsl(var(--navy))',
  				'2': 'hsl(var(--teal))',
  				'3': 'hsl(var(--success))',
  				'4': 'hsl(var(--amber))',
  				'5': 'hsl(var(--destructive))'
  			},
  		},
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			},
  			'fade-up': {
  				from: { opacity: '0', transform: 'translateY(16px)' },
  				to: { opacity: '1', transform: 'translateY(0)' }
  			},
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-up': 'fade-up 0.5s ease-out',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
  safelist: [
    'bg-green-50', 'text-green-700', 'border-green-200',
    'bg-amber-50', 'text-amber-700', 'border-amber-200',
    'bg-blue-50', 'text-blue-700', 'border-blue-200',
    'bg-red-50', 'text-red-700', 'border-red-200',
    'bg-teal-50', 'text-teal-700', 'border-teal-200',
  ]
}