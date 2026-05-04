import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { StudentListItem } from '../../types';

interface Props { students: StudentListItem[] }

// Major Indian cities with approximate SVG coordinates (mapped to India outline)
const CITY_COORDS: Record<string, { x: number; y: number; name: string }> = {
  'Mumbai':      { x: 155, y: 310, name: 'Mumbai' },
  'Delhi':       { x: 195, y: 175, name: 'Delhi' },
  'Bangalore':   { x: 195, y: 395, name: 'Bengaluru' },
  'Chennai':     { x: 220, y: 415, name: 'Chennai' },
  'Hyderabad':   { x: 210, y: 345, name: 'Hyderabad' },
  'Pune':        { x: 165, y: 325, name: 'Pune' },
  'Kolkata':     { x: 300, y: 255, name: 'Kolkata' },
  'Ahmedabad':   { x: 140, y: 255, name: 'Ahmedabad' },
  'Jaipur':      { x: 175, y: 215, name: 'Jaipur' },
  'Lucknow':     { x: 240, y: 210, name: 'Lucknow' },
  'Chandigarh':  { x: 190, y: 155, name: 'Chandigarh' },
  'Bhopal':      { x: 210, y: 270, name: 'Bhopal' },
  'Nagpur':      { x: 225, y: 295, name: 'Nagpur' },
  'Coimbatore':  { x: 195, y: 430, name: 'Coimbatore' },
  'Kochi':       { x: 180, y: 445, name: 'Kochi' },
};

const CITY_NAMES = Object.keys(CITY_COORDS);

function assignCity(student: StudentListItem, index: number) {
  return CITY_COORDS[CITY_NAMES[index % CITY_NAMES.length]];
}

function riskColor(tier: string) {
  if (tier === 'HIGH') return '#DC2626';
  if (tier === 'MEDIUM') return '#D97706';
  return '#16A34A';
}

export function IndiaMap({ students }: Props) {
  const [hoveredStudent, setHoveredStudent] = useState<StudentListItem | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  // Group students by assigned city
  const cityGroups: Record<string, StudentListItem[]> = {};
  students.forEach((s, i) => {
    const city = CITY_NAMES[i % CITY_NAMES.length];
    if (!cityGroups[city]) cityGroups[city] = [];
    cityGroups[city].push(s);
  });

  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 420 520" className="w-full h-full" style={{ maxHeight: 440 }}>
        {/* India outline — simplified path */}
        <path
          d="M185,55 L210,50 L235,60 L260,70 L280,90 L295,110 L305,135 L315,155 L320,180 L315,205 L305,220 L320,240 L335,265 L340,290 L335,315 L325,335 L310,355 L300,370 L290,385 L280,395 L265,405 L255,415 L245,430 L235,445 L225,460 L215,470 L205,465 L195,455 L185,445 L175,435 L165,420 L158,405 L152,390 L148,375 L145,360 L142,345 L140,325 L138,305 L135,285 L133,265 L130,245 L128,225 L130,205 L132,185 L138,165 L145,148 L152,132 L158,115 L162,100 L168,85 L175,70 Z
          M133,265 L115,270 L100,280 L92,295 L95,310 L103,320 L112,315 L125,305 L135,290 Z
          M260,70 L275,65 L290,68 L298,80 L295,92 L285,95 L270,88 Z"
          fill="#F1F5F9"
          stroke="#CBD5E1"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* State boundaries hint */}
        <path
          d="M195,175 L215,180 M215,180 L220,210 M220,210 L210,245 M210,245 L225,270 M155,310 L180,295 M180,295 L215,300 M215,300 L225,270"
          stroke="#E2E8F0"
          strokeWidth="0.8"
          strokeDasharray="3 2"
          fill="none"
        />

        {/* City cluster markers */}
        {Object.entries(cityGroups).map(([city, cityStudents]) => {
          const coord = CITY_COORDS[city];
          if (!coord) return null;
          const highCount = cityStudents.filter(s => s.risk_tier === 'HIGH').length;
          const medCount = cityStudents.filter(s => s.risk_tier === 'MEDIUM').length;
          const total = cityStudents.length;
          const dominantColor = highCount > 0 ? '#DC2626' : medCount > total / 2 ? '#D97706' : '#16A34A';
          const r = Math.min(6 + total * 1.5, 14);

          return (
            <g key={city}>
              {/* Pulse ring for high-risk cities */}
              {highCount > 0 && (
                <circle cx={coord.x} cy={coord.y} r={r + 4} fill={dominantColor} opacity="0.15">
                  <animate attributeName="r" values={`${r+2};${r+7};${r+2}`} dur="2s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.15;0.05;0.15" dur="2s" repeatCount="indefinite"/>
                </circle>
              )}
              <circle
                cx={coord.x} cy={coord.y}
                r={r}
                fill={dominantColor}
                opacity={0.85}
                stroke="white"
                strokeWidth="1.5"
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  const rect = (e.target as SVGCircleElement).closest('svg')!.getBoundingClientRect();
                  setHoveredStudent(cityStudents[0]);
                  setTooltipPos({ x: coord.x / 420 * rect.width, y: coord.y / 520 * rect.height });
                }}
                onMouseLeave={() => setHoveredStudent(null)}
              />
              {total > 1 && (
                <text x={coord.x} y={coord.y + 1} textAnchor="middle" dominantBaseline="middle"
                  fill="white" fontSize="7" fontWeight="600" style={{ pointerEvents: 'none' }}>
                  {total}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredStudent && (
        <div className="absolute bg-white border border-slate-200 rounded-lg p-3 shadow-card-hover text-xs pointer-events-none z-10"
          style={{ left: tooltipPos.x + 8, top: tooltipPos.y - 40, minWidth: 140 }}>
          <p className="font-medium text-slate-900 mb-1">{hoveredStudent.name}</p>
          <p className="text-slate-500">{hoveredStudent.course_type}</p>
          <div className="flex items-center gap-1 mt-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${
              hoveredStudent.risk_tier === 'HIGH' ? 'bg-red-500' :
              hoveredStudent.risk_tier === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />
            <span className={
              hoveredStudent.risk_tier === 'HIGH' ? 'text-red-600' :
              hoveredStudent.risk_tier === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'
            }>{hoveredStudent.risk_tier} · {(hoveredStudent.risk_score * 100).toFixed(0)}%</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex gap-3">
        {[['HIGH', '#DC2626'], ['MEDIUM', '#D97706'], ['LOW', '#16A34A']].map(([tier, color]) => (
          <div key={tier} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            {tier}
          </div>
        ))}
      </div>
    </div>
  );
}