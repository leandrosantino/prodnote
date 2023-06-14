import { IUsersRepository } from '../../repositories/IUsersRepository'
import { IUserAuthRequestDTO } from './UserAuthDTO';
import { IJwtProvider } from '../../providers/IJwtProvider';
import { IPassProvider } from '../../providers/IPassProvider';

export class UserAuth {

  constructor(
    public usersRepository: IUsersRepository,
    public jwt: IJwtProvider,
    public pass: IPassProvider
  ) { }

  async execute(data: IUserAuthRequestDTO) {

    const user = await this.usersRepository.findByUserName(data.userName)

    if (!user) {
      throw new Error('Unregistered User')
    }

    if (this.pass.verify(data.password, user.password)) {
      const access_token = this.jwt.sign({
        name: user.name,
        id: user.id
      }, {
        expiresIn: '1 days'
      })

      return access_token
    }

    throw new Error('Invalid Password!')


  }

}