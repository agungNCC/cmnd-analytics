import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Check, Database, Download, FileSpreadsheet, PackageCheck } from 'lucide-react'

gsap.registerPlugin(useGSAP)

const STEPS = [
  { label: 'Preparing data', threshold: 20, icon: Database },
  { label: 'Building worksheets', threshold: 70, icon: FileSpreadsheet },
  { label: 'Packaging workbook', threshold: 90, icon: PackageCheck },
  { label: 'Starting download', threshold: 100, icon: Download },
]

const getStatus = (progress) => {
  if (progress < 20) return 'Collecting the latest completion data...'
  if (progress < 70) return 'Generating formulas, pivots, and worksheets...'
  if (progress < 90) return 'Validating and packaging the Excel workbook...'
  return 'Your download is almost ready...'
}

export default function ExportLoadingScreen({ progress = 0 }) {
  const rootRef = useRef(null)
  const progressRef = useRef(null)
  const safeProgress = Math.min(100, Math.max(0, Number(progress) || 0))

  useGSAP(() => {
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
      intro
        .from('.export-loading-card', { autoAlpha: 0, y: 18, scale: 0.97, duration: 0.45 })
        .from('.export-loading-step', {
          autoAlpha: 0,
          x: -10,
          duration: 0.3,
          stagger: 0.07,
        }, '-=0.2')

      gsap.to('.export-loading-orbit', {
        rotation: 360,
        duration: 2.4,
        ease: 'none',
        repeat: -1,
        transformOrigin: '50% 50%',
      })
      gsap.to('.export-loading-document', {
        y: -4,
        scale: 1.035,
        duration: 0.85,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
      gsap.to('.export-loading-dot', {
        y: -5,
        autoAlpha: 0.35,
        duration: 0.55,
        ease: 'sine.inOut',
        stagger: 0.14,
        repeat: -1,
        yoyo: true,
      })
    })

    return () => mm.revert()
  }, { scope: rootRef })

  useGSAP(() => {
    gsap.to(progressRef.current, {
      scaleX: safeProgress / 100,
      duration: 0.55,
      ease: 'power2.out',
      transformOrigin: 'left center',
      overwrite: 'auto',
    })
  }, { dependencies: [safeProgress], scope: rootRef })

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/55 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-loading-title"
      aria-describedby="export-loading-status"
    >
      <div className="export-loading-card w-full max-w-lg overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl">
        <div className="bg-gradient-to-br from-primary-700 via-primary-700 to-red-800 px-6 py-7 text-white">
          <div className="flex items-center gap-5">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
              <div className="export-loading-orbit absolute inset-0 rounded-full border-2 border-white/20 border-t-white" />
              <div className="export-loading-document flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary-700 shadow-lg will-change-transform">
                <FileSpreadsheet className="h-8 w-8" aria-hidden="true" />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                Excel Export
              </p>
              <h2 id="export-loading-title" className="mt-1 text-xl font-semibold">
                Generating your report
              </h2>
              <p id="export-loading-status" className="mt-1 text-sm text-white/80" aria-live="polite">
                {getStatus(safeProgress)}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Export progress</span>
              <span className="font-semibold tabular-nums text-primary-700">{safeProgress}%</span>
            </div>
            <div
              className="h-2.5 overflow-hidden rounded-full bg-gray-100"
              role="progressbar"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={safeProgress}
            >
              <div
                ref={progressRef}
                className="h-full w-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-primary-700 to-red-500"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const previousThreshold = index === 0 ? 0 : STEPS[index - 1].threshold
              const complete = safeProgress >= step.threshold
              const active = !complete && safeProgress >= previousThreshold

              return (
                <div
                  key={step.label}
                  className={[
                    'export-loading-step flex items-center gap-3 rounded-xl border px-3 py-3 transition-colors',
                    complete
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : active
                        ? 'border-primary-200 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-gray-50 text-gray-400',
                  ].join(' ')}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                    {complete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </span>
                  <span className="text-sm font-medium">{step.label}</span>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
            <span>Please keep this window open</span>
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className="export-loading-dot h-1.5 w-1.5 rounded-full bg-primary-600 will-change-transform"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
