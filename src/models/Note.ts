import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface NoteAttributes {
  id?: number; // Make id optional since it's auto-generated
  title: string;
  content: string;
  filePath?: string; // Optional field
  createdAt?: Date;
  updatedAt?: Date;
}

class Note extends Model<NoteAttributes> {
  declare id: number; // Use declare instead of public
  declare title: string;
  declare content: string;
  declare filePath?: string;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

Note.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: true, // Make it explicitly optional
    }
  },
  {
    sequelize,
    modelName: 'Note',
    timestamps: true, // Enable timestamps (createdAt, updatedAt)
  }
);

export default Note;