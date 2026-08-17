import {
  CATEGORY_COLORS,
  CATEGORY_POINTS,
} from '../data';

import { CAT_ICONS } from '../constants';

// ── DayView ───────────────────────────────────────────────────────────────

export default function DayView({
  day,
  tasks = [],
  progress,
  notes = {},
  onToggle,
  onNoteClick,
  categoryPoints = CATEGORY_POINTS,
}) {
  const dayProgress = progress[day] || [];

  const completed = dayProgress.filter(Boolean).length;

  const total = tasks.length;

  const dayPts = tasks.reduce(
    (sum, task) => sum + (categoryPoints[task.category] || 1),
    0
  );

  const earnedPts = tasks.reduce(
    (sum, task, i) =>
      sum + (dayProgress[i] ? (categoryPoints[task.category] || 1) : 0),
    0
  );

  const allDone = completed === total && total > 0;

  return (
    <div
      style={{
        background: '#111118',
        border: '1px solid #1e1e2e',
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 12,
      }}
    >

      {/* ────────────────────────────────────────────────────────────────
          Day header
      ──────────────────────────────────────────────────────────────── */}

      <div
        style={{
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${
            allDone
              ? 'rgba(110,231,183,0.2)'
              : '#1e1e2e'
          }`,
          background: allDone
            ? 'rgba(110,231,183,0.04)'
            : 'transparent',
        }}
      >
        <div>

          <span
            style={{
              color: '#6b7280',
              fontSize: 12,
            }}
          >
            Day {day}
          </span>

          <span
            style={{
              color: '#374151',
              fontSize: 12,
              margin: '0 8px',
            }}
          >
            ·
          </span>

          <span
            style={{
              color: '#9ca3af',
              fontSize: 12,
            }}
          >
            {tasks[0]?.date}
          </span>

          {tasks[0]?.week && (
            <span
              style={{
                color: '#374151',
                fontSize: 11,
                marginLeft: 8,
              }}
            >
              · {tasks[0].week}
            </span>
          )}

        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >

          <span
            style={{
              color: '#fcd34d',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {earnedPts}/{dayPts} pts
          </span>

          <span
            style={{
              background: allDone
                ? 'rgba(110,231,183,0.15)'
                : '#1a1a2e',

              color: allDone
                ? '#6ee7b7'
                : '#4b5563',

              fontSize: 11,

              padding: '3px 10px',

              borderRadius: 20,

              fontWeight: 600,
            }}
          >
            {completed}/{total}
          </span>

        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────
          Task list
      ──────────────────────────────────────────────────────────────── */}

      <div
        style={{
          padding: '8px 10px',
        }}
      >

        {tasks.map((task, i) => {

          const done = !!dayProgress[i];

          const categoryColor =
            CATEGORY_COLORS[task.category] || '#6b7280';

          const categoryPoints_task =
            categoryPoints[task.category] || 1;

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '9px 8px',
                borderRadius: 8,
                background: done
                  ? 'rgba(110,231,183,0.04)'
                  : 'transparent',
                transition: 'background 0.15s',
              }}
            >

              {/* ────────────────────────────────────────────────
                  Checkbox
              ──────────────────────────────────────────────── */}

              <div
                onClick={() =>
                  onToggle(day, i)
                }
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 5,
                  flexShrink: 0,
                  marginTop: 1,

                  border: `2px solid ${
                    done
                      ? '#6ee7b7'
                      : '#2a2a3a'
                  }`,

                  background: done
                    ? '#6ee7b7'
                    : 'transparent',

                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',

                  transition: 'all 0.15s',

                  cursor: 'pointer',
                }}
              >
                {done && (
                  <span
                    style={{
                      color: '#0a1a10',
                      fontSize: 11,
                      fontWeight: 900,
                    }}
                  >
                    ✓
                  </span>
                )}
              </div>

              {/* ────────────────────────────────────────────────
                  Task content
              ──────────────────────────────────────────────── */}

              <div
                style={{
                  flex: 1,
                  cursor: 'pointer',
                }}
                onClick={() =>
                  onToggle(day, i)
                }
              >

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 2,
                  }}
                >

                  <span
                    style={{
                      background:
                        `${categoryColor}22`,

                      color: categoryColor,

                      fontSize: 10,

                      padding: '1px 7px',

                      borderRadius: 10,

                      fontWeight: 700,
                    }}
                  >
                    {CAT_ICONS[task.category] || '📌'}{' '}
                    {task.category}
                  </span>

                  <span
                    style={{
                      color: '#374151',
                      fontSize: 10,
                    }}
                  >
                    +{categoryPoints_task}pt
                  </span>

                </div>

                <p
                  style={{
                    color: done
                      ? '#6b7280'
                      : '#d1d5db',

                    fontSize: 13,

                    margin: 0,

                    lineHeight: 1.5,

                    textDecoration: done
                      ? 'line-through'
                      : 'none',
                  }}
                >
                  {task.task}
                </p>

              </div>

              {/* ────────────────────────────────────────────────
                  Note button
              ──────────────────────────────────────────────── */}

              {done &&
                (() => {

                  const hasNote =
                    !!(
                      notes[
                        `${day}_${i}`
                      ]?.trim()
                    );

                  return (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        onNoteClick?.(
                          day,
                          i
                        );
                      }}
                      title={
                        hasNote
                          ? 'Edit note'
                          : 'Add note'
                      }
                      style={{
                        background: hasNote
                          ? 'rgba(110,231,183,0.1)'
                          : 'transparent',

                        border: `1px solid ${
                          hasNote
                            ? 'rgba(110,231,183,0.3)'
                            : '#2a2a3a'
                        }`,

                        borderRadius: 6,

                        padding: '3px 7px',

                        cursor: 'pointer',

                        color: hasNote
                          ? '#6ee7b7'
                          : '#374151',

                        fontSize: 12,

                        flexShrink: 0,

                        marginTop: 2,

                        transition:
                          'all 0.15s',
                      }}
                    >
                      {hasNote
                        ? '📝'
                        : '✎'}
                    </button>
                  );

                })()}

            </div>
          );
        })}

        {/* Empty state */}

        {tasks.length === 0 && (
          <div
            style={{
              padding: '20px 10px',
              color: '#4b5563',
              fontSize: 12,
              textAlign: 'center',
            }}
          >
            No tasks available for this day.
          </div>
        )}

      </div>
    </div>
  );
}