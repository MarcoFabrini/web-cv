import Reveal from './Reveal.jsx';

export default function SectionHead({ n, title }) {
  return (
    <Reveal className="sh">
      <span className="no">0{n}</span>
      <h2>{title}</h2>
    </Reveal>
  );
}
