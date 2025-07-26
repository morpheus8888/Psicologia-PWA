'use client';

import { useState } from 'react';
import { Trans } from '@lingui/react';

const animals = [
  'leone', 'gatto', 'cane', 'orso', 'volpe', 'lupo', 
  'coniglio', 'panda', 'tigre', 'elefante'
];

interface AvatarSelectionProps {
  currentAvatar: string;
  onSave: (newAvatar: string) => Promise<void>;
  onCancel: () => void;
}

export default function AvatarSelection({ currentAvatar, onSave, onCancel }: AvatarSelectionProps) {
  const [selectedAnimal, setSelectedAnimal] = useState(currentAvatar);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveClick = async () => {
    setIsSaving(true);
    await onSave(selectedAnimal);
    setIsSaving(false);
  };

  return (
    <div className="avatar-selection">
      <h2><Trans id="Scegli il tuo animale" /></h2>
      <p><Trans id="Animale selezionato:" /> <strong><Trans id={selectedAnimal} /></strong></p>
      
      <h3 style={{ marginTop: '1.5rem' }}><Trans id="Tutti gli animali disponibili" /></h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '1.5rem' }}>
        {animals.map((animal) => (
          <button 
            key={animal} 
            onClick={() => setSelectedAnimal(animal)}
            style={{ border: selectedAnimal === animal ? '3px solid dodgerblue' : '1px solid grey', padding: '5px', borderRadius: '8px', cursor: 'pointer' }}
          >
            <img src={`/images/animals/${animal}.svg`} alt={animal} width="60" height="60" />
            <p style={{ margin: 0, marginTop: '5px' }}><Trans id={animal} /></p>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={handleSaveClick} disabled={isSaving}>
          {isSaving ? <Trans id="Salvando..." /> : <Trans id="Salva Avatar" />}
        </button>
        <button onClick={onCancel} disabled={isSaving}>
          <Trans id="Annulla" />
        </button>
      </div>
    </div>
  );
}