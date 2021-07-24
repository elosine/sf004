\version "2.20.0"

\paper{
  paper-width = 160
  paper-height = 100

  top-margin = 0
  bottom-margin = 0
  left-margin = 1
  right-margin = 1
  
  system-system-spacing =
  #'((basic-distance . 15)  %this controls space between lines default = 12
      (minimum-distance . 8)
      (padding . 1)
      (stretchability . 60)) 

}

\book {

  \header {
    tagline = ##f
  }

  \score {

    <<

      \override Score.BarNumber.break-visibility = ##(#f #f #f)

      \new Staff \with {
        \omit TimeSignature
        % \omit BarLine
        %\omit Clef
        \omit KeySignature
        \override StaffSymbol.thickness = #1
      }

      {
        \time 4/4
        %\override TupletBracket.bracket-visibility = ##t
        \override TupletBracket.bracket-visibility = ##f
        \override TupletNumber.visibility = ##f
        %S\set tupletFullLength = ##t
        \override NoteHead.font-size = #-1
        \override Stem.details.beamed-lengths = #'(7)
        \override Stem.details.lengths = #'(7)
        \override NoteColumn.accent-skip = ##t
        %\stopStaff
        %\once \override TupletNumber #'text = "7:4"
        
        
        % Dummy first and last line so that the vertical space isn't re adjusted
        \stopStaff
        \override NoteHead.transparent = ##t
        \override NoteHead.no-ledgers = ##t 
        \override Script.transparent = ##t
        \override Stem.transparent = ##t  
        \override TupletBracket.bracket-visibility = ##f
        \override TupletNumber.transparent = ##t
        \override Staff.Clef.transparent =##t
        \override Staff.BarLine.transparent =##t
        c'4c'c'c'c'c'c'c'
        
     
        \startStaff
        \override Staff.Clef.transparent =##f
        \override Staff.BarLine.transparent =##f
        \override NoteHead.transparent = ##f
        \override NoteHead.no-ledgers = ##f
        \override Script.transparent = ##f
        \override Stem.transparent = ##f
        \override TupletBracket.bracket-visibility = ##t
        \override TupletNumber.transparent = ##f
        \repeat volta 2{
          
          
          %           e'4 %quarter
          %           fis'4 %quarter sharp
          %           c'4 %quarter 1 ledger on
          %           cis'4 %quarter sharp 1 ledger on
          %           
          %           a4 %quarter 2 ledger on
          %           g4 %quarter 2 ledger below
          %           gis4 %quarter sharp 2 ledger below 
          %           r4 %rest
          %           
          %           r8 [e'8]%8thR-8th
          %           r8 [fis'8] %8thR-8th sharp
          %           r8 [c'8] %8thR-8th 1 ledger on
          %           r8 [cis'8] %8thR-8th sharp 1 ledger on
          %           
          %           r8 [a8] %8thR-8th 2 ledger on
          %           r8 [g8] %8thR-8th 2 ledger below
          %           r8 [gis8] %8thR-8th sharp 2 ledger below
          %           r8 [e'16 e']% 8thR-16th-16th


          r8 [fis'16 fis']% 8thR-16th-16th sharp
          r8 [c'16 c']% 8thR-16th-16th 1 ledger on
          r8 [cis'16 cis']% 8thR-16th-16th sharp 1 ledger on
          r8 [a16 a]% 8thR-16th-16th 2 ledgers on
          
          r8 [g16 g]% 8thR-16th-16th 2 ledgers below
          r8 [gis16 gis]% 8thR-16th-16th sharp 2 ledgers below
          e'16 [e' r8] % 16th-16th-8thR
          fis'16 [fis' r8] % 16th-16th-8thR sharp
          
          c'16 [c' r8] % 16th-16th-8thR 1 ledger on
          cis'16 [cis' r8] % 16th-16th-8thR sharp 1 ledger on
          a16 [a r8] % 16th-16th-8thR 2 ledgers on
          g16 [g r8] % 16th-16th-8thR 2 ledgers below
          
          gis16 [gis r8]% 16th-16th-8thR sharp 2 ledgers below
          r8. [e'16]  % Dt8thR-16th
          r8. [fis'16]  % Dt8thR-16th sharp
          r8. [c'16]  % Dt8thR-16th 1 ledger on
          
 
         
          
          %  c'16c'c'c'  
          %           c'4        
          %           \tuplet 5/4 {c'''16\hide-> c'''c'''c'''c'''}       
          %           \tuplet 5/4 {f16\hide-> f f f f} 
          %           
          %           c'4  
          %           c'4 
          %           \tuplet 5/4 {    f16\hide-> f f f f }            
          %           \tuplet 5/4 {c'''16\hide-> c'''c'''c'''c'''}  
        }
        
        
        % Dummy first and last line so that the vertical space isn't re adjusted
        \stopStaff
        \override Staff.Clef.transparent =##t
        c'4c'c'c'c'c'c'c'
      }

    >>

    \layout{
      \context {
        \Score
        proportionalNotationDuration = #(ly:make-moment 1/20) %smallest space quintuplet or 5*4
        %proportionalNotationDuration = #(ly:make-moment 1/28)
        %proportionalNotationDuration = #(ly:make-moment 1/8)
        %\override SpacingSpanner.uniform-stretching = ##t
        %  \override SpacingSpanner.strict-note-spacing = ##t
        %  \override SpacingSpanner.strict-grace-spacing = ##t
        \override Beam.breakable = ##t
        \override Glissando.breakable = ##t
        \override TextSpanner.breakable = ##t
        \override NoteHead.no-ledgers = ##t 
      }

      indent = 0
      line-width = 158
      #(layout-set-staff-size 20)
      %\hide Stem
      % \hide NoteHead
      % \hide LedgerLineSpanner
      % \hide TupletNumber 
    }

    \midi{}

  }
}

