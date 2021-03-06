import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm'
import { IsNotEmpty } from 'class-validator'

@Entity({ orderBy: { title: 'ASC' }})
export class Country {

    @PrimaryGeneratedColumn()
    public id?: number

    @Index({ unique: true })
    @Column()
    @IsNotEmpty()
    public title?: string

}
